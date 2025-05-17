// Dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

type MovingJob = Schema["MovingJob"]["type"];
type Customer = Schema["Customer"]["type"];

export default function Dashboard() {
  const [jobs, setJobs] = useState<MovingJob[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const jobsResult = await client.models.MovingJob.list();
        const customersResult = await client.models.Customer.list();
        
        setJobs(jobsResult.data);
        setCustomers(customersResult.data);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Count jobs by status
  const jobsByStatus = {
    SCHEDULED: jobs.filter(job => job.status === 'SCHEDULED').length,
    IN_PROGRESS: jobs.filter(job => job.status === 'IN_PROGRESS').length,
    COMPLETED: jobs.filter(job => job.status === 'COMPLETED').length,
    CANCELLED: jobs.filter(job => job.status === 'CANCELLED').length,
  };

  // Get upcoming jobs (scheduled in the next 7 days)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingJobs = jobs.filter(job => {
    if (!job.scheduledDate || !job.status) return false;
    const jobDate = new Date(job.scheduledDate);
    return jobDate >= today && jobDate <= nextWeek && job.status !== 'CANCELLED';
  });

  // Calculate revenue (sum of estimated costs of completed jobs)
  const totalRevenue = jobs
    .filter(job => job.status === 'COMPLETED')
    .reduce((sum, job) => sum + (job.actualCost || job.estimatedCost || 0), 0);

  function getCustomerName(customerId: string): string {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown Customer";
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="stats-container">
        <div className="stat-card">
          <h3>Customers</h3>
          <p className="stat-number">{customers.length}</p>
        </div>
        
        <div className="stat-card">
          <h3>Active Jobs</h3>
          <p className="stat-number">{jobsByStatus.SCHEDULED + jobsByStatus.IN_PROGRESS}</p>
        </div>
        
        <div className="stat-card">
          <h3>Completed Jobs</h3>
          <p className="stat-number">{jobsByStatus.COMPLETED}</p>
        </div>
        
        <div className="stat-card">
          <h3>Revenue</h3>
          <p className="stat-number">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="upcoming-jobs">
        <h3>Upcoming Jobs (Next 7 Days)</h3>
        
        {upcomingJobs.length === 0 ? (
          <p>No upcoming jobs in the next 7 days.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>From</th>
                <th>To</th>
                <th>Size</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.scheduledDate ? formatDate(job.scheduledDate) : 'N/A'}</td>
                  <td>{getCustomerName(job.customerId)}</td>
                  <td>{job.currentAddress}</td>
                  <td>{job.destinationAddress}</td>
                  <td>{job.jobSize}</td>
                  <td className={`status-${job.status ? job.status.toLowerCase() : 'unknown'}`}>
                    {job.status ? job.status.replace('_', ' ') : 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}