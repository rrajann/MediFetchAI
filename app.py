from flask import Flask, request, render_template, jsonify
import PyPDF2
import fitz
import os
import copy
import shutil
import  numpy
from transformers import BertTokenizer, BertModel
import torch
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, storage
import uuid
import numpy as np
from pinecone import Pinecone, PodSpec
import base64
import os
from dotenv import load_dotenv



app = Flask(__name__)
CORS(app)

load_dotenv()
pinecone_api_key = os.environ.get('PINECONE_API_KEY')


tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

# Initialize Firebase Admin
cred = credentials.Certificate('serviceAccountKey.json')  # Update the path to your JSON file
firebase_admin.initialize_app(cred, {
    'storageBucket': 'nwhacks24-b5e70.appspot.com'
})

pc = Pinecone(api_key='')
index_name = "nwhacks" 


pinecone_index = pc.Index(index_name)


db = firestore.client()
bucket = storage.bucket()

@app.route('/')
def index():
    clear_output_folder()
    return render_template('index.html')

@app.route('/query_embeddings', methods=['POST'])
def query_embeddings_route():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400

    prompt = data.get('prompt')
    namespace = data.get('namespace')

    print(f"Prompt {prompt} Namespace {namespace}")

    if not prompt or not namespace:
        return jsonify({"error": "Prompt and namespace are required."}), 400

    try:
        query_results = query_embeddings(prompt, namespace)
        return jsonify(query_results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def query_embeddings(prompt, namespace):

    print(prompt)
    inputs = tokenizer(prompt, return_tensors="pt")
    print(inputs)
    outputs = model(**inputs)
    embeddings = outputs.last_hidden_state.mean(dim=1).detach().numpy()
    embeddings_list = embeddings.tolist()


    try:
        query_results = pinecone_index.query(vector=embeddings_list[0], top_k=5, namespace=namespace)
        similar_ids = [match['id'] for match in query_results['matches']] if 'matches' in query_results else []

        # Fetch and encode PDFs from Firebase
        pdf_data = fetch_and_encode_pdfs(similar_ids, namespace)
        return {"similar_ids": similar_ids, "pdf_data": pdf_data}
    except Exception as e:
        raise e

def fetch_and_encode_pdfs(uuid_list, user_id):
    pdf_data = {}
    for uuid in uuid_list:
        blob_path = f'{user_id}/{uuid}.pdf'
        blob = bucket.blob(blob_path)

        # Fetch the file and encode it
        pdf_bytes = blob.download_as_bytes()
        encoded_pdf = base64.b64encode(pdf_bytes).decode('utf-8')
        pdf_data[uuid] = encoded_pdf

    return pdf_data


def save_pdfs_from_firebase(uuid_list, user_id):
    output_dir = os.path.join('output', user_id)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for uuid in uuid_list:
        blob_path = f'{user_id}/{uuid}.pdf'
        blob = bucket.blob(blob_path)

        # Save the file locally
        local_file_path = os.path.join(output_dir, f'{uuid}.pdf')
        blob.download_to_filename(local_file_path)
        print(f'Successfully downloaded {blob_path} to {local_file_path}.')

@app.route('/upload', methods=['POST'])
def upload():
    files = request.files.getlist('pdf') 
    user_id = request.form.get('userID')
    if files:
        output_dir = 'output'
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        for file in files:  # Iterate over each file
            if file:  # Check if the file is valid
                filename = file.filename
                file_path = os.path.join(output_dir, filename)
                file.save(file_path)
                process_pdf(file_path, user_id)
    return 'PDFs processed and saved in output folder.'



def process_pdf(file_path, user_id):
    reader = PyPDF2.PdfReader(file_path)
    for page_num, page in enumerate(reader.pages):
        width = page.mediabox.width
        height = page.mediabox.height

        slice_height = height / 6 

        for i in range(6):
            writer = PyPDF2.PdfWriter()
            y0 = slice_height * i
            y1 = y0 + slice_height

            crop_page = copy.deepcopy(page)
            crop_page.mediabox.lower_left = (0, y0)
            crop_page.mediabox.upper_right = (width, y1)
            writer.add_page(crop_page)

            output_filename = f'output/page_{page_num+1}_slice_{i+1}.pdf'
            with open(output_filename, 'wb') as output_file:
                writer.write(output_file)

            random_hash = uuid.uuid4()
            extract_text_and_convert_to_embeddings(crop_page, page_num, i, user_id, random_hash)


            upload_to_firebase(output_filename, page_num, i, user_id, random_hash)

def upload_to_firebase(file_path, page_num, section_num, user_id, uuid_generated):
    try:
        

        blob_path = f'{user_id}/{uuid_generated}.pdf'
        blob = bucket.blob(blob_path)

        blob.upload_from_filename(file_path)
        print(f'Successfully uploaded {file_path} to Firebase Storage as {blob_path}.')
    except Exception as e:
        print(f'Error uploading {file_path} to Firebase Storage: {e}')

def clear_output_folder():
    output_dir = 'output'
    for filename in os.listdir(output_dir):
        file_path = os.path.join(output_dir, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')

def extract_text_and_convert_to_embeddings(cropped_page, page_num, section_num, user_id, uuid_generated):
    temp_writer = PyPDF2.PdfWriter()
    temp_pdf_path = 'temp_cropped.pdf'
    temp_writer.add_page(cropped_page)

    with open(temp_pdf_path, 'wb') as temp_pdf_file:
        temp_writer.write(temp_pdf_file)

    text = ''
    try:
        with fitz.open(temp_pdf_path) as doc:
            page = doc.load_page(0)
            text = page.get_text()
    except Exception as e:
        print(f"Error extracting text: {e}")

    if len(text) < 10:
        return

    text_filename = f'output/page_{page_num+1}_slice_{section_num+1}.txt'
    with open(text_filename, 'w', encoding='utf-8') as text_file:
        text_file.write(text)

    # Generate BERT embedding
    inputs = tokenizer(text, return_tensors="pt")
    outputs = model(**inputs)


    print(text)
    embeddings = outputs.last_hidden_state.mean(dim=1).detach().numpy()

    embeddings_list = embeddings.tolist()

    pinecone_index.upsert(vectors=[(str(uuid_generated), embeddings_list[0])],
             namespace=user_id)

    return embeddings




if __name__ == '__main__':
    app.run(debug=True)
