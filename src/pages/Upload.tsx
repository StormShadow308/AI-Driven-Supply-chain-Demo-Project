import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UploadTab from '@/components/Upload/UploadTab';
import { Sparkles } from 'lucide-react';

interface LocationState {
  preselectedDepartment?: string;
}

const Upload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { preselectedDepartment } = (location.state as LocationState) || {};
  
  return (
    <div className="flex flex-col space-y-8">
      {/* Header with glow effect */}
      <div className="flex flex-col space-y-3">
        <h1 className="section-title text-3xl md:text-4xl font-bold flex items-center">
          <Sparkles className="mr-2 text-primary" size={28} />
          Supply Chain Insights
        </h1>
        <p className="section-subtitle text-lg text-white/70">
          Upload your data to unlock powerful analytics and predictions
        </p>
      </div>
      
      {/* Stats summary - similar to the image */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="stat-card glow-blue">
          <div className="stat-value">15+</div>
          <div className="stat-label">Analytics Products</div>
        </div>
        <div className="stat-card glow-effect">
          <div className="stat-value">2.5B+</div>
          <div className="stat-label">Records Processed</div>
        </div>
        <div className="stat-card glow-purple">
          <div className="stat-value">800k+</div>
          <div className="stat-label">Daily Insights</div>
        </div>
      </div>
      
      {/* Main content section */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-6">Upload Data</h2>
        <UploadTab preselectedDepartment={preselectedDepartment} />
      </div>
    </div>
  );
};

export default Upload;
