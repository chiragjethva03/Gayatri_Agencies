"use client";
import React, { useState } from 'react';
import MemoForm from './MemoForm'; // Importing the form component from the same directory

export default function MemoActions() {
  // State to control the visibility of the Add Memo Form
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <button 
          className="btn-primary" 
          onClick={() => setIsAddModalOpen(true)}
        >
          Add
        </button>
        
        <button className="btn-secondary">Edit</button>
        <button className="btn-secondary">View</button>
        <button className="btn-secondary">Delete</button>
        <button className="btn-secondary">Refresh</button>
      </div>

      {/* The Modal Component */}
      {/* It sits here but only shows up when isAddModalOpen is true */}
      <MemoForm 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </>
  );
}