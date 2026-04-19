import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AgentDashboard() {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedField, setSelectedField] = useState(null);
    const [updateData, setUpdateData] = useState({
        stage_at_time: '',
        notes: '',
        requires_attention: false
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchMyFields();
    }, []);

    const fetchMyFields = async () => {
        try {
            const response = await api.get('fields/');
            setFields(response.data);
        } catch (error) {
            console.error("Error fetching fields", error);
            if (error.response?.status === 401) handleLogout();
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const openUpdateModal = (field) => {
        setSelectedField(field);
        setUpdateData({
            stage_at_time: field.current_stage,
            notes: '',
            requires_attention: false
        });
        setIsModalOpen(true);
    };

    const submitUpdate = async (e) => {
        e.preventDefault();
        try {
            // Note the custom URL matching our Django @action!
            await api.post(`fields/${selectedField.id}/add_update/`, updateData);
            setIsModalOpen(false);
            fetchMyFields(); // Refresh the list to show new status
        } catch (error) {
            console.error("Failed to post update", error);
            alert("Failed to submit update.");
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading your fields...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-green-700">Shamba Records - Field Agent</h1>
                <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-red-600">Sign Out</button>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">My Assigned Fields</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage and update your crop progress</p>
                </div>

                {fields.length === 0 ? (
                    <div className="bg-white p-10 rounded-lg shadow-sm border text-center">
                        <p className="text-gray-500">You have no fields assigned to you yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {fields.map(field => (
                            <div key={field.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">{field.name}</h3>
                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium border">
                                        {field.current_stage}
                                    </span>
                                </div>
                                <div className="space-y-2 mb-6">
                                    <p className="text-sm text-gray-600"><span className="font-medium text-gray-900">Crop:</span> {field.crop_type}</p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium text-gray-900">System Status:</span>{' '}
                                        <span className={`font-medium ${field.status === 'Active' ? 'text-green-600' : field.status === 'At Risk' ? 'text-red-600' : 'text-blue-600'}`}>
                                            {field.status}
                                        </span>
                                    </p>
                                </div>
                                {/* NEW onClick HANDLER HERE */}
                                <button 
                                    onClick={() => openUpdateModal(field)}
                                    className="w-full bg-green-50 text-green-700 py-2 rounded-md border border-green-200 hover:bg-green-100 transition font-medium text-sm"
                                >
                                    Update Progress
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* THE UPDATE MODAL */}
            {isModalOpen && selectedField && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Update: {selectedField.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">Log current stage and any field observations.</p>
                        
                        <form onSubmit={submitUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Stage</label>
                                <select 
                                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                                    value={updateData.stage_at_time}
                                    onChange={(e) => setUpdateData({...updateData, stage_at_time: e.target.value})}
                                >
                                    <option value="PLANTED">Planted</option>
                                    <option value="GROWING">Growing</option>
                                    <option value="READY">Ready for Harvest</option>
                                    <option value="HARVESTED">Harvested</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Observations / Notes</label>
                                <textarea 
                                    required
                                    rows="3"
                                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                                    placeholder="e.g., Looks healthy, needs more water, observed pests..."
                                    value={updateData.notes}
                                    onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="flex items-center mt-4">
                                <input 
                                    type="checkbox" 
                                    id="attention"
                                    className="h-4 w-4 text-red-600 rounded"
                                    checked={updateData.requires_attention}
                                    onChange={(e) => setUpdateData({...updateData, requires_attention: e.target.checked})}
                                />
                                <label htmlFor="attention" className="ml-2 block text-sm text-red-600 font-medium">
                                    Flag for Attention (At Risk)
                                </label>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm bg-gray-100 rounded-md">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm text-white bg-green-600 rounded-md">Save Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}