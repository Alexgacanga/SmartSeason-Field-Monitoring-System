import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AdminDashboard() {
    // Core Data State
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal & Assignment State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [agents, setAgents] = useState([]); 
    const [formData, setFormData] = useState({
        name: '',
        crop_type: '',
        planting_date: '',
        agent_id: '' 
    });

    const navigate = useNavigate();

    // Fetch data when component loads
    useEffect(() => {
        fetchFields();
        fetchAgents(); 
    }, []);

    const fetchFields = async () => {
        try {
            const response = await api.get('fields/');
            setFields(response.data);
        } catch (error) {
            console.error("Error fetching fields", error);
            if (error.response?.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAgents = async () => {
        try {
            const response = await api.get('agents/');
            setAgents(response.data);
        } catch (error) {
            console.error("Error fetching agents", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    // Form Submission Logic
    const handleCreateField = async (e) => {
        e.preventDefault();
        try {
            // Django expects the field name to be "agent", not "agent_id"
            const payload = {
                ...formData,
                agent: formData.agent_id || null 
            };
            
            await api.post('fields/', payload);
            setIsModalOpen(false); // Close the modal
            setFormData({ name: '', crop_type: '', planting_date: '', agent_id: '' }); // Reset form
            fetchFields(); // Refresh the table to show the new field!
        } catch (error) {
            console.error("Failed to create field", error);
            alert("Error creating field. Check console for details.");
        }
    };

    // Calculate Summary Statistics
    const totalFields = fields.length;
    const activeFields = fields.filter(f => f.status === 'Active').length;
    const atRiskFields = fields.filter(f => f.status === 'At Risk').length;
    const completedFields = fields.filter(f => f.status === 'Completed').length;

    if (loading) return <div className="p-10 text-center text-gray-500">Loading dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-green-700">Shamba Records Admin</h1>
                <button 
                    onClick={handleLogout} 
                    className="text-sm text-gray-600 hover:text-red-600 transition"
                >
                    Sign Out
                </button>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard label="Total Fields" value={totalFields} />
                    <StatCard label="Active" value={activeFields} color="green" />
                    <StatCard label="At Risk" value={atRiskFields} color="red" />
                    <StatCard label="Completed" value={completedFields} color="blue" />
                </div>

                {/* Data Table Container */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">All Fields Overview</h2>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition shadow-sm"
                        >
                            + Add New Field
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                                    <th className="px-6 py-3 font-medium">Field Name</th>
                                    <th className="px-6 py-3 font-medium">Crop Type</th>
                                    <th className="px-6 py-3 font-medium">Assigned Agent</th>
                                    <th className="px-6 py-3 font-medium">Current Stage</th>
                                    <th className="px-6 py-3 font-medium">System Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {fields.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No fields found. Create one to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    fields.map((field) => (
                                        <tr key={field.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 font-medium text-gray-800">{field.name}</td>
                                            <td className="px-6 py-4 text-gray-600">{field.crop_type}</td>
                                            <td className="px-6 py-4 text-gray-600">{field.agent_name || 'Unassigned'}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                                                    {field.current_stage}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    field.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                    field.status === 'At Risk' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {field.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* CREATE FIELD MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Register New Field</h3>
                        <form onSubmit={handleCreateField} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Field Name</label>
                                <input 
                                    type="text" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 outline-none"
                                    placeholder="e.g., North Plot A"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Crop Type</label>
                                <input 
                                    type="text" required
                                    value={formData.crop_type}
                                    onChange={(e) => setFormData({...formData, crop_type: e.target.value})}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 outline-none"
                                    placeholder="e.g., Maize, Beans"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Planting Date</label>
                                <input 
                                    type="date" required
                                    value={formData.planting_date}
                                    onChange={(e) => setFormData({...formData, planting_date: e.target.value})}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Assign Field Agent (Optional)</label>
                                <select
                                    value={formData.agent_id}
                                    onChange={(e) => setFormData({...formData, agent_id: e.target.value})}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white outline-none"
                                >
                                    <option value="">-- Leave Unassigned --</option>
                                    {agents.map(agent => (
                                        <option key={agent.id} value={agent.id}>
                                            {agent.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition shadow-sm"
                                >
                                    Save Field
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

/* Small reusable component for the top cards */
function StatCard({ label, value, color = "gray" }) {
    const colors = {
        gray: "text-gray-700 border-gray-100",
        green: "text-green-700 border-green-100",
        red: "text-red-700 border-red-100",
        blue: "text-blue-700 border-blue-100",
    };

    return (
        <div className={`bg-white p-6 rounded-lg shadow-sm border ${colors[color]}`}>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
    );
}