"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

type MovingJob = Schema["MovingJob"]["type"];
type Customer = Schema["Customer"]["type"];
type MovingJobStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type MovingJobSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';

export default function JobList() {
  const [jobs, setJobs] = useState<MovingJob[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    currentAddress: "",
    destinationAddress: "",
    scheduledDate: "",
    status: "SCHEDULED" as MovingJobStatus,
    jobSize: "MEDIUM" as MovingJobSize,
    specialItems: "",
    estimatedCost: "",
    actualCost: "",
    notes: "",
  });

  useEffect(() => {
    loadJobs();
    loadCustomers();
  }, []);

  async function loadJobs() {
    setLoading(true);
    try {
      const { data } = await client.models.MovingJob.list();
      setJobs(data);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomers() {
    try {
      const { data } = await client.models.Customer.list();
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  }

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Convert string values to appropriate types
    const jobData = {
      ...formData,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      actualCost: formData.actualCost ? parseFloat(formData.actualCost) : undefined,
      scheduledDate: new Date(formData.scheduledDate).toISOString(),
    };
    
    try {
      await client.models.MovingJob.create(jobData);
      setFormData({
        customerId: "",
        currentAddress: "",
        destinationAddress: "",
        scheduledDate: "",
        status: "SCHEDULED" as MovingJobStatus,
        jobSize: "MEDIUM" as MovingJobSize,
        specialItems: "",
        estimatedCost: "",
        actualCost: "",
        notes: "",
      });
      setShowForm(false);
      loadJobs();
    } catch (error) {
      console.error("Error creating job:", error);
    }
  }

  async function handleDelete(id: string) {
    try {
      await client.models.MovingJob.delete({ id });
      loadJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  }

  async function handleStatusChange(id: string, newStatus: MovingJobStatus) {
    try {
      await client.models.MovingJob.update({
        id,
        status: newStatus,
      });
      loadJobs();
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  }

  function getCustomerName(customerId: string): string {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unknown Customer";
  }

  function formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  return (
    <div className="job-list">
      <div className="section-header">
        <h2>Moving Jobs</h2>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Job"}
        </button>
      </div>

      {showForm && (
        <form className="add-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customerId">Customer</label>
            <select
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="currentAddress">Current Address</label>
            <input
              type="text"
              id="currentAddress"
              name="currentAddress"
              value={formData.currentAddress}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="destinationAddress">Destination Address</label>
            <input
              type="text"
              id="destinationAddress"
              name="destinationAddress"
              value={formData.destinationAddress}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="scheduledDate">Scheduled Date</label>
            <input
              type="date"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="jobSize">Job Size</label>
            <select
              id="jobSize"
              name="jobSize"
              value={formData.jobSize}
              onChange={handleInputChange}
              required
            >
              <option value="SMALL">Small</option>
              <option value="MEDIUM">Medium</option>
              <option value="LARGE">Large</option>
              <option value="EXTRA_LARGE">Extra Large</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="specialItems">Special Items</label>
            <textarea
              id="specialItems"
              name="specialItems"
              value={formData.specialItems}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="estimatedCost">Estimated Cost ($)</label>
            <input
              type="number"
              id="estimatedCost"
              name="estimatedCost"
              value={formData.estimatedCost}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit">Save Job</button>
        </form>
      )}

      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <div className="list-container">
          {jobs.length === 0 ? (
            <p>No jobs found. Add a new job to get started.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Scheduled Date</th>
                  <th>Current Address</th>
                  <th>Destination</th>
                  <th>Job Size</th>
                  <th>Status</th>
                  <th>Estimated Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>{getCustomerName(job.customerId)}</td>
                    <td>{formatDate(job.scheduledDate)}</td>
                    <td>{job.currentAddress}</td>
                    <td>{job.destinationAddress}</td>
                    <td>{job.jobSize}</td>
                    <td>
                      {job.status && (
                        <select
                          value={job.status}
                          onChange={(e) =>
                            handleStatusChange(job.id, e.target.value as MovingJobStatus)
                          }
                          className={`status-${job.status.toLowerCase()}`}
                        >
                          <option value="SCHEDULED">Scheduled</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      )}
                    </td>
                    <td>${job.estimatedCost}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(job.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}