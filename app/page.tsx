"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import CustomerList from "@/components/CustomerList";
import JobList from "@/components/JobList";
import Dashboard from "@/components/Dashboard";

Amplify.configure(outputs);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="crm-container">
          <header>
            <h1>Moving Company CRM</h1>
            <div className="user-info">
              <span>Welcome, {user?.username}</span>
              <button onClick={signOut}>Sign Out</button>
            </div>
          </header>
          
          <main>
            <div className="tabs">
              <div className="tab-list">
                <button 
                  className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </button>
                <button 
                  className={`tab-button ${activeTab === 'customers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('customers')}
                >
                  Customers
                </button>
                <button 
                  className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('jobs')}
                >
                  Jobs
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'customers' && <CustomerList />}
                {activeTab === 'jobs' && <JobList />}
              </div>
            </div>
          </main>
        </div>
      )}
    </Authenticator>
  );
}