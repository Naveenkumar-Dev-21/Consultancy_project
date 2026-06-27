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

    const inputClass = "clay-input mt-1.5";

    if (loading) return (
        <div className="flex justify-center py-20 min-h-screen">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-400 border-t-transparent"></div>
        </div>
    );

    if (!user) return null;

    return (
        <div className="min-h-screen py-10 sm:py-20" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <header className="mb-8 sm:mb-10 text-center">
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">My Profile</h1>
                    <p className="text-gray-400 dark:text-gray-500 text-base">Manage your account and preferences.</p>
                </header>

                <div className="clay-card p-5 sm:p-8 relative">
                    {/* Header Section with Edit Button */}
                    <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg text-white border-2 border-white/50">
                                <span className="text-xl sm:text-3xl font-black">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{user.name}</h2>
                                <span className="bg-rose-50 dark:bg-rose-500/10 text-rose-500 text-xs px-3 py-1 rounded-full mt-2 inline-block font-black uppercase tracking-wider border border-rose-200 dark:border-rose-500/25">
                                    {user.role === 'admin' ? 'Administrator' : 'Customer'}
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-charcoal-700 text-rose-500 rounded-full text-sm font-black transition-all border border-white/50 dark:border-white/5 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.06),inset_2px_2px_4px_rgba(255,255,255,0.8)] active:scale-95"
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
                            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-rose-100 dark:border-white/10">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3.5 bg-gray-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 font-black rounded-full hover:bg-gray-200 transition-colors text-base shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.06),inset_2px_2px_4px_rgba(255,255,255,0.8)] border border-white/50 dark:border-white/5">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-3.5 btn-primary rounded-full text-base flex items-center justify-center gap-2">
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        )}

                        {/* Nav Buttons */}
                        {!isEditing && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-rose-100 dark:border-white/10">
                                <button type="button" onClick={() => navigate('/myorders')} className="btn-primary py-4 rounded-full flex items-center justify-center gap-2 text-base">
                                    <Package size={18} /> View My Orders
                                </button>
                                <button type="button" onClick={logoutHandler} className="bg-red-500 text-white font-black py-4 rounded-full flex items-center justify-center gap-2 hover:bg-red-600 transition-colors border border-red-400/25 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.15),inset_2px_2px_4px_rgba(255,255,255,0.25)] text-base">
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
