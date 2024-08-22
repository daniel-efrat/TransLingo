import io
import os
import re
from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from pydub import AudioSegment
from openai import OpenAI
from docx import Document
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# Load environment variables from .env file
load_dotenv()

# Instantiate the OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def convert_to_mp3(file, filename):
    ext = filename.split('.')[-1].lower()
    print(f"File extension detected: {ext}")

    if ext == 'mp3':
        print("File is already in MP3 format, no conversion needed.")
        file.seek(0)
        mp3_buffer = io.BytesIO(file.read())
        mp3_buffer.name = filename
        return mp3_buffer
    else:
        print(f"Converting {ext} to MP3...")
        audio = AudioSegment.from_file(file, format=ext)
        mp3_buffer = io.BytesIO()
        audio.export(mp3_buffer, format="mp3")
        mp3_buffer.name = "audio.mp3"
        mp3_buffer.seek(0)
        return mp3_buffer

def add_paragraph_with_direction(doc, text):
    # Detect if text is RTL or LTR based on the presence of Hebrew/Arabic characters
    rtl_pattern = re.compile(r'[\u0590-\u05FF\u0600-\u06FF]')
    is_rtl = rtl_pattern.search(text)

    paragraph = doc.add_paragraph(text.strip())

    if is_rtl:
        paragraph.alignment = 2  # Right alignment
        set_rtl(paragraph)
    else:
        paragraph.alignment = 0  # Left alignment

def set_rtl(paragraph):
    p = paragraph._element
    pPr = p.get_or_add_pPr()

    # Set RTL direction
    bidi = OxmlElement('w:bidi')
    bidi.set(qn('w:val'), "1")
    pPr.append(bidi)

    # Explicitly set paragraph alignment to right
    alignment = OxmlElement('w:jc')
    alignment.set(qn('w:val'), "right")
    pPr.append(alignment)

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Enable template auto-reloading
    app.config['TEMPLATES_AUTO_RELOAD'] = True

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/transcribe", methods=["POST"])
    def transcribe():
        try:
            file = request.files["audio"]
            filename = file.filename
            print(f"Received file: {filename}")

            # Convert the uploaded file to mp3 if necessary
            mp3_buffer = convert_to_mp3(file, filename)
            print("File conversion successful.")

            # Request transcription with timecodes
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=mp3_buffer,
                response_format="verbose_json"  # Get detailed JSON response including timecodes
            )
            print("Transcription successful.")

            # Ensure each segment ends with a period
            for segment in transcript.segments:
                if not segment['text'].strip().endswith('.'):
                    segment['text'] = segment['text'].strip() + '.'

            return jsonify({"output": transcript.segments})

        except Exception as e:
            print(f"Error during transcription: {e}")
            return jsonify({"error": str(e)}), 500

    @app.route("/translate", methods=["POST"])
    def translate():
        try:
            data = request.get_json()
            text = data['text']
            target_language = data['language']

            prompt = f"Translate the following text to {target_language}:\n\n{text}\n\nOutput only the translated text."

            translation = client.chat.completions.create(
                model="gpt-4o-mini",  # Use the correct model name
                messages=[{"role": "user", "content": prompt}]
            )

            translated_text = translation.choices[0].message.content
            return jsonify({"output": translated_text})

        except Exception as e:
            print(f"Error during translation: {e}")
            return jsonify({"error": str(e)}), 500

    @app.route("/download", methods=["POST"])
    def download():
        try:
            data = request.get_json()
            segments = data.get('segments', [])
            file_format = data.get('format', '')

            if not segments or not file_format:
                raise ValueError("Segments or format missing from request")

            if file_format == 'docx':
                try:
                    # Generate DOCX
                    doc = Document()
                    for segment in segments:
                        # Check if the segment is a string or a dictionary
                        if isinstance(segment, dict):
                            text = segment.get('text', '')
                        else:
                            text = segment  # Assume it's already a string

                        add_paragraph_with_direction(doc, text)
                    
                    buffer = io.BytesIO()
                    doc.save(buffer)
                    buffer.seek(0)
                    return send_file(buffer, as_attachment=True, download_name="transcription.docx", mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                except Exception as e:
                    print(f"Error generating DOCX: {e}")
                    return jsonify({"error": "Error generating DOCX"}), 500

            elif file_format == 'srt':
                try:
                    # Generate SRT
                    srt_content = generate_srt(segments)
                    buffer = io.BytesIO(srt_content.encode('utf-8'))
                    buffer.seek(0)
                    return send_file(buffer, as_attachment=True, download_name="transcription.srt", mimetype="text/plain")
                except Exception as e:
                    print(f"Error generating SRT: {e}")
                    return jsonify({"error": "Error generating SRT"}), 500

            elif file_format == 'vtt':
                try:
                    # Generate WebVTT
                    vtt_content = generate_vtt(segments)
                    buffer = io.BytesIO(vtt_content.encode('utf-8'))
                    buffer.seek(0)
                    return send_file(buffer, as_attachment=True, download_name="transcription.vtt", mimetype="text/vtt")
                except Exception as e:
                    print(f"Error generating VTT: {e}")
                    return jsonify({"error": "Error generating VTT"}), 500

            else:
                return jsonify({"error": "Unsupported format"}), 400

        except Exception as e:
            print(f"Error in download endpoint: {e}")
            return jsonify({"error": "Internal Server Error"}), 500

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
