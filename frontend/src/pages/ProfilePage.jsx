import React, { useEffect, useState } from 'react';
import { User, Mail, Calendar, MapPin, Package, LogOut, Save, Edit2, Baby } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: {
            street: '',
            city: '',
            postalCode: '',
            country: '',
            phone: ''
        },
        babyDetails: {
            name: '',
            gender: '',
            age: '',
            weight: '',
            size: ''
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo) {
                navigate('/login?redirect=profile');
                return;
            }

            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                const { data } = await api.get('/api/users/profile', config);
                setUser(data);
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    address: {
                        street: data.address?.street || '',
                        city: data.address?.city || '',
                        postalCode: data.address?.postalCode || '',
                        country: data.address?.country || '',
                        phone: data.address?.phone || ''
                    },
                    babyDetails: {
                        name: data.babyDetails?.name || '',
                        gender: data.babyDetails?.gender || '',
                        age: data.babyDetails?.age || '',
                        weight: data.babyDetails?.weight || '',
                        size: data.babyDetails?.size || ''
                    }
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('userInfo');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (e, section = null) => {
        const { name, value } = e.target;
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await api.put('/api/users/profile', formData, config);

            setUser(data);
            setIsEditing(false);

            const updatedUserInfo = { ...userInfo, name: data.name };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
        window.location.reload();
    };

    const inputClass = "w-full mt-1.5 p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none transition-all disabled:opacity-50 disabled:bg-gray-50 text-base";

    if (loading) return (
        <div className="flex justify-center py-20 min-h-screen">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-400 border-t-transparent"></div>
        </div>
    );

    if (!user) return null;

    return (
        <div className="min-h-screen py-10 sm:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <header className="mb-8 sm:mb-10 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
                    <p className="text-gray-400 text-base">Manage your account and preferences.</p>
                </header>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-soft border border-rose-100/60 relative">
                    {/* Header Section with Edit Button */}
                    <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center shadow-md text-rose-400 border-2 border-rose-200">
                                <User size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{user.name}</h2>
                                <span className="bg-rose-50 text-rose-500 text-xs px-3 py-1 rounded-full mt-2 inline-block font-bold uppercase tracking-wider border border-rose-200">
                                    {user.role === 'admin' ? 'Administrator' : 'Customer'}
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl text-sm font-bold hover:from-rose-500 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                        >
                            {isEditing ? 'Cancel Edit' : <><Edit2 size={14} /> Edit Profile</>}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10 sm:space-y-12">
                        {/* Personal Info */}
                        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <User size={18} className="text-rose-400" /> Personal Details
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                                        <input type="email" name="email" value={formData.email} disabled={true} className={`${inputClass} cursor-not-allowed text-gray-400`} />
                                    </div>
                                </div>
                            </div>

                            {/* Baby Details */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Baby size={18} className="text-rose-400" /> Baby's Info
                                </h3>
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Baby's Name</label>
                                        <input type="text" name="name" value={formData.babyDetails.name} onChange={(e) => handleChange(e, 'babyDetails')} disabled={!isEditing} placeholder="e.g. Aadhiran" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Age</label>
                                        <input type="text" name="age" value={formData.babyDetails.age} onChange={(e) => handleChange(e, 'babyDetails')} disabled={!isEditing} placeholder="e.g. 2 years" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gender</label>
                                        <select name="gender" value={formData.babyDetails.gender} onChange={(e) => handleChange(e, 'babyDetails')} disabled={!isEditing} className={inputClass}>
                                            <option value="">Select</option>
                                            <option value="Boy">Boy</option>
                                            <option value="Girl">Girl</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Weight (kg)</label>
                                        <input type="text" name="weight" value={formData.babyDetails.weight} onChange={(e) => handleChange(e, 'babyDetails')} disabled={!isEditing} placeholder="e.g. 12" className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Size</label>
                                        <input type="text" name="size" value={formData.babyDetails.size} onChange={(e) => handleChange(e, 'babyDetails')} disabled={!isEditing} placeholder="e.g. 2T" className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-rose-400" /> Shipping Address
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Street Address</label>
                                    <input type="text" name="street" value={formData.address.street} onChange={(e) => handleChange(e, 'address')} disabled={!isEditing} className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">City</label>
                                    <input type="text" name="city" value={formData.address.city} onChange={(e) => handleChange(e, 'address')} disabled={!isEditing} className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Postal Code</label>
                                    <input type="text" name="postalCode" value={formData.address.postalCode} onChange={(e) => handleChange(e, 'address')} disabled={!isEditing} className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Country</label>
                                    <input type="text" name="country" value={formData.address.country} onChange={(e) => handleChange(e, 'address')} disabled={!isEditing} className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</label>
                                    <input type="text" name="phone" value={formData.address.phone} onChange={(e) => handleChange(e, 'address')} disabled={!isEditing} className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-rose-100">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-base">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-3.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold rounded-xl hover:from-rose-500 hover:to-pink-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 text-base">
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        )}

                        {/* Nav Buttons */}
                        {!isEditing && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-rose-100">
                                <button type="button" onClick={() => navigate('/myorders')} className="bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:from-rose-500 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/20 text-base">
                                    <Package size={18} /> View My Orders
                                </button>
                                <button type="button" onClick={logoutHandler} className="bg-red-50 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors border border-red-200 text-base">
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
