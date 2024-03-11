# MediFetchAI

## Motivation

This project was born out of personal frustration with the lengthy hospital patient processing times. Recognizing that every second is crucial, especially for doctors who are constantly racing against time, we set out to develop a tool that streamlines the patient management process. Our goal was to create a solution that not only expedites the administrative tasks but also enhances the overall efficiency of patient care.

## About the Project

MediFetch AI revolutionizes patient care by streamlining the way medical professionals access and understand a patient's medical history. By utilizing advanced NLP technology, this platform allows users to submit their medical documents, which are then efficiently processed and organized. When a healthcare professional needs specific information, MediFetch AI queries these documents and displays the most relevant sections, tailored to the query. This innovative approach not only consolidates a patient's health history into one accessible location but also significantly reduces the time healthcare providers spend sifting through extensive medical records. With MediFetch AI, medical professionals can quickly grasp a patient's medical background, ensuring faster and more effective care.

## Technologies Used

The project leverages a robust stack of technologies across machine learning, backend, and frontend development to ensure a seamless and efficient experience:

### Frontend

- **React**: Used for building the user interface, ensuring a responsive and interactive web application.
- **Tailwind CSS**: Utilized for styling the application, enabling rapid UI development.

### Backend

- **Flask**: Serves as the backend framework, facilitating RESTful API development for handling application logic and data processing.
- **Firestore/Firebase Auth**: Used for database management and authentication processes, where each user has their own medical documents.

### Machine Learning

- **BERT**: Used for embedding patient's medical documents into n-dimensional vectors.
- **Pinecone**: Utilized for vector database services, enabling efficient similarity search when a doctor queries a patient's medical history
