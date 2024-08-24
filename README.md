# TransLingo Pro

AI video & audio transcription, translation and summary with Flask & OpenAI API

Live app: [translingo.pro](https://www.translingo.pro)

Live app: [translingo.pro](https://www.translingo.pro)

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- Python 3.7 or higher
- pip (Python package manager)
- Git

You'll also need an OpenAI API key to use the transcription and translation features.

## Installation

Follow these steps to set up the project locally:

1. Clone the repository:
   ```
   git clone https://github.com/daniel-efrat/TransLingo.git
   cd TransLingo
   ```

2. Set up a virtual environment:

   - On Windows:
     ```
     python -m venv venv
     venv\Scripts\activate
     ```

   - On macOS and Linux:
     ```
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Copy the `.env.example` file to a new file named `.env`:
     - On Windows:
       ```
       copy .env.example .env
       ```
     - On macOS and Linux:
       ```
       cp .env.example .env
       ```
   - Open the `.env` file and replace the placeholder values with your actual credentials:
     ```
     OPENAI_API_KEY=your_api_key_here
     ```

5. Start the Flask development server:
   ```
   flask run
   ```

6. Open your browser and visit `http://localhost:5000` (or the port specified in your configuration).

## Deactivating the virtual environment

When you're done working on the project, you can deactivate the virtual environment:

- On Windows:
  ```
  venv\Scripts\deactivate
  ```

- On macOS and Linux:
  ```
  deactivate
  ```

## Contributing

If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
