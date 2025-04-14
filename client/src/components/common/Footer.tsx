import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{
      padding: '2rem',
      marginTop: '2rem',
      backgroundColor: "#f9f9f9",
      border: '0px solid #ddd',
      textAlign: 'center',
      fontSize: '14px',
      color: '#666',
      borderRadius: '8px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ marginBottom: '1rem' }}>
          Format Editor - Your Ultimate Data Transformation Solution
        </p>
        <p style={{ marginBottom: '1rem' }}>
          Transform, process, and manage your data with our powerful visual pipeline tool. Format Editor provides an intuitive interface for handling JSON, CSV, and XML data formats. Create efficient data workflows, automate your data processing tasks, and streamline your data transformation pipelines with our advanced editor.
        </p>
        <p style={{ marginBottom: '1rem' }}>
          Our data transformation platform offers:
        </p>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0,
          marginBottom: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <li>• JSON Editor: Edit, validate, and transform JSON data with ease</li>
          <li>• CSV Processor: Convert, clean, and manipulate CSV files efficiently</li>
          <li>• XML Transformer: Handle XML data with our specialized tools</li>
          <li>• Visual Pipeline Builder: Create complex data workflows without coding</li>
          <li>• Data Automation: Schedule and automate your data processing tasks</li>
          <li>• Workflow Management: Organize and track your data transformation projects</li>
        </ul>
        <p style={{ marginBottom: '1rem' }}>
          Whether you're a data analyst, developer, or business professional, Format Editor helps you streamline your data operations. Our platform supports various data formats and provides powerful tools for data validation, transformation, and automation. Create custom data pipelines, implement ETL processes, and manage your data workflows efficiently.
        </p>
        <p>
          © {new Date().getFullYear()} Format Editor. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 