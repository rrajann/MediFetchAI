import React, { useState } from 'react';
import { Navbar } from '../login/Login';
import { auth, db } from '../../firebaseConfig';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const DocumentCard = ({ title, summary, base64Pdf, onPin }) => {
  // Convert base64 to a Blob
  const pdfBlob = base64Pdf ? new Blob([Uint8Array.from(atob(base64Pdf), c => c.charCodeAt(0))], { type: 'application/pdf' }) : null;

  // Create a URL for the Blob
  const pdfUrl = pdfBlob ? URL.createObjectURL(pdfBlob) : '';

  return (
    <div className="bg-green-100 p-6 shadow-lg rounded-lg my-4">
      <h3 className="font-bold">{title}</h3>
      <p>{summary}</p>
      {/* React-PDF Viewer */}
      {base64Pdf && (
        <Document
          file={pdfUrl}
          onLoadError={console.error}
          renderMode="canvas"
        >
          <Page pageNumber={1} width={600} />
        </Document>
      )}
      <button onClick={onPin} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">Pin/Unpin</button>
    </div>
  );
};


const DocumentsWindow = ({ documents, setDocuments, input, onSearchChange, onSearchSubmit }) => {
  const handlePin = (index) => {
    const newDocuments = documents.map((doc, idx) => {
      if (idx === index) {
        return { ...doc, pinned: !doc.pinned };
      }
      return doc;
    });
    setDocuments(newDocuments);
  };

  return (
    <div className="flex flex-col flex-grow ml-8 mr-8">
      <SearchBar input={input} onSearchChange={onSearchChange} onSearchSubmit={onSearchSubmit} />
      <div className="overflow-auto p-6 bg-gray-300 rounded-xl shadow-lg my-4" style={{ height: 'calc(100% - 237px)' }}>
        <h3 className="font-bold mb-4">Search Results</h3>
        {documents.map((doc, index) => (
          <DocumentCard key={index} {...doc} onPin={() => handlePin(index)} />
        ))}
      </div>
    </div>
  );
};

function Pinned({ documents, setDocuments}) {

  const handlePin = (title) => {
    const newDocuments = documents.map((doc) => {
      if (doc.title === title) {
        return { ...doc, pinned: false };
      }
      return doc;
    });
    setDocuments(newDocuments);
  };

  return (
  <div className="bg-green-300 p-6 rounded-lg shadow-lg mr-8" style={{ width: '30%', height: 'calc(100% - 100px)', overflowY: 'auto' }}>
    <h3 className="font-bold mb-4">Pinned</h3>
    {documents.filter(doc => doc.pinned).map((doc, index) => (
      <div key={index} className="bg-green-100 p-4 shadow-md rounded-lg mb-4">
        <h4 className="font-bold">{doc.title}</h4>
        <p>{doc.summary}</p>
        <button onClick={() => handlePin(doc.title)}>Unpin</button>
      </div>
    ))}
  </div>
);
}

const SearchBar = ({ input, onSearchChange, onSearchSubmit }) => (
  
  
  <div className="bg-green-300 p-6 rounded-lg shadow-lg mb-4 flex">
    <input
      className="flex-grow p-4 mr-4 rounded-lg"
      type="text"
      value={input}
      onChange={onSearchChange}
      placeholder="Enter search query..."
    />
    <button type="submit" onClick={onSearchSubmit} className="bg-green-500 text-white px-6 py-3 rounded-lg">Search</button>
  </div>
);

const Search = () => {

  const user = auth.currentUser;
  const [documents, setDocuments] = useState([]);
  const [input, setInput] = useState('');

  const handleSearch = async (query) => {
    // Assuming you have a method to get the Firebase user ID
    const userId = auth.currentUser;

    const requestBody = {
        prompt: query,
        namespace: userId.uid
    };

    try {
        const response = await fetch('http://127.0.0.1:5000/query_embeddings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Example of how to set mock document titles to the response
        const mockDocuments = data.similar_ids.map((id, index) => ({
          title: `Document Result ${index + 1}: ${id}`,
          summary: `This is a summary of document with ID ${id}`,
          pinned: false,
          base64Pdf: data.pdf_data[id] // Add this line
        }));
        setDocuments(mockDocuments);

    } catch (error) {
        console.error('Failed to fetch documents:', error);
    }
};

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(input);
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-grow p-8 flex">
        <DocumentsWindow documents={documents} setDocuments={setDocuments} input={input} onSearchChange={(e) => setInput(e.target.value)} onSearchSubmit={handleSubmit} />
        <Pinned documents={documents} setDocuments={setDocuments} />
      </div>
    </div>
  );
};

export default Search;
