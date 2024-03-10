from flask import Flask, request, render_template
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
import jsonify
import os
from dotenv import load_dotenv


load_dotenv()

pinecone_api_key = os.environ.get("PINECONE_API_KEY")

pc = Pinecone(pinecone_api_key)
index_name = "nwhacks" 


pinecone_index = pc.Index(index_name)


tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

def query_embeddings(prompt, namespace):

    if not prompt or not namespace:
        return"error 1" + str(e)

    # Generate BERT embedding for the prompt
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model(**inputs)

    embeddings = outputs.last_hidden_state.mean(dim=1).detach().numpy()

    embeddings_list = embeddings.tolist()


    # Query the Pinecone index within the given namespace
    try:
        query_results = pinecone_index.query(vector=embeddings_list[0], top_k=5, namespace=namespace)
        if 'matches' in query_results:
            for match in query_results['matches']:
                print("Vector ID:", match['id'])

    except Exception as e:
        return str(e)
    

if __name__ == "__main__":
    print(query_embeddings("Economics", "IKuTA8YmmaXrNpfZJmAOO9zcfEl2"))