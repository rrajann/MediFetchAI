import os
from pinecone import Pinecone, PodSpec
import numpy as np
import uuid
import os
from dotenv import load_dotenv


load_dotenv()

pinecone_api_key = os.environ.get("PINECONE_API_KEY")


pc = Pinecone(api_key=pinecone_api_key)
index_name = "nwhacks" 



        
index = pc.Index(index_name)
sample_query_vector = np.random.rand(768).tolist() 

for user_id in users:
    namespace = f"user_namespace_{user_id}"

    for vector_data in get_user_vectors(user_id):  # Replace with your method to get user vectors
        vector_id = str(uuid.uuid4())  # Generate a unique vector ID
        user_vector = vector_data  # This should be the vector data for the user

        # Upsert the vector into the user's namespace
        index.upsert(vectors=[(vector_id, user_vector)], namespace=namespace)


index.upsert(vectors=[(vector_id, user_vector)], namespace=namespace)

# Creating namespace
index.upsert(vectors=[('id-1', sample_query_vector)],
             namespace='my-first-namespace')


# # Query with a sample vector

top_k = 5  # Number of nearest neighbors to retrieve

results = index.query(vector=sample_query_vector, top_k=top_k)
print('ANITA MAX WYNN', results)
