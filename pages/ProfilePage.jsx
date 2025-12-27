import React, { useEffect, useState } from 'react';
import { User, Mail, Calendar, MapPin, Package, LogOut, Save, Edit2, Baby } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProfilePage = () => {
    const navigate = useNavigate();
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
                const { data } = await axios.get('/api/users/profile', config);
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

            const { data } = await axios.put('/api/users/profile', formData, config);

            setUser(data);
            setIsEditing(false);

            // Update local storage name if changed
            const updatedUserInfo = { ...userInfo, name: data.name };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

            alert('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
        window.location.reload();
    };

    if (loading) return (
        <div className="flex justify-center py-20 bg-[#f5f5f7] min-h-screen">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-beelittle-coral border-t-transparent"></div>
        </div>
    );

    if (!user) return null;

    return (
        <div className="bg-[#f5f5f7] min-h-screen py-20">
            <div className="max-w-4xl mx-auto px-6">
                <header className="mb-10 text-center flex justify-between items-end">
                    <div className="flex-1 text-center">
                        <h1 className="text-3xl font-bold text-apple-text mb-2">My Profile</h1>
                        <p className="text-apple-text/50">Manage your account and preferences.</p>
                    </div>
                </header>

                <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-black/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-beelittle-coral to-orange-300 opacity-10" />

                    {/* Header Section with Edit Button */}
                    <div className="relative flex justify-between items-start mb-10">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md text-beelittle-coral">
                                <User size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-apple-text">{user.name}</h2>
                                <span className="bg-zinc-100 text-zinc-500 text-xs px-3 py-1 rounded-full mt-2 inline-block font-bold uppercase tracking-wider">
                                    {user.role === 'admin' ? 'Administrator' : 'Customer'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-full text-sm font-bold hover:bg-zinc-800 transition-colors"
                        >
                            {isEditing ? 'Cancel Edit' : <><Edit2 size={14} /> Edit Profile</>}
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Personal Info */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-bold text-apple-text mb-4 flex items-center gap-2">
                                    <User size={18} className="text-beelittle-coral" /> Personal Details
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-beelittle-coral outline-none transition-all disabled:opacity-60"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            disabled={true}
                                            className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl outline-none cursor-not-allowed text-zinc-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Baby Details */}
                            <div>
                                <h3 className="text-lg font-bold text-apple-text mb-4 flex items-center gap-2">
                                    <Baby size={18} className="text-beelittle-coral" /> Baby's Info
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Baby's Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.babyDetails.name}
                                            onChange={(e) => handleChange(e, 'babyDetails')}
                                            disabled={!isEditing}
                                            placeholder="e.g. Aadhiran"
                                            className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-beelittle-coral outline-none transition-all disabled:opacity-60"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Age</label>
                                        <input
                                            type="text"
                                            name="age"
                                            value={formData.babyDetails.age}
                                            onChange={(e) => handleChange(e, 'babyDetails')}
                                            disabled={!isEditing}
                                            placeholder="e.g. 2 years"
                                            className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-beelittle-coral outline-none transition-all disabled:opacity-60"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Gender</label>
                                        <select
                                            name="gender"
                                            value={formData.babyDetails.gender}
                                            onChange={(e) => handleChange(e, 'babyDetails')}
                                            disabled={!isEditing}
                                            className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-beelittle-coral outline-none transition-all disabled:opacity-60"
                                        >
                                            <option value="">Select</option>
                                            <option value="Boy">Boy</option>
                                            <option value="Girl">Girl</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Weight (kg)</label>
                                        <input
                                            type="text"
                                            name="weight"
                                            value={formData.babyDetails.weight}
                                            onChange={(e) => handleChange(e, 'babyDetails')}
                                            disabled={!isEditing}
                                            placeholder="e.g. 12"
                                            className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-beelittle-coral outline-none transition-all disabled:opacity-60"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Size</label>
                                        <input
                                            type="text"
                                            name="size"
                                            value={formData.babyDetails.size}
                                            onChange={(e) => handleChange(e, 'babyDetails')}
                                            disabled={!isEditing}
                                            placeholder="e.g. 2T"
                                            className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-beelittle-coral outline-none transition-all disabled:opacity-60"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div>
                            <h3 className="text-lg font-bold text-apple-text mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-beelittle-coral" /> Shipping Address
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Street Address</label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={formData.address.street}
                                        onChange={(e) => handleChange(e, 'address')}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-beelittle-coral outline-none transition-all disabled:opacity-60"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.address.city}
                                        onChange={(e) => handleChange(e, 'address')}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-beelittle-coral outline-none transition-all disabled:opacity-60"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Postal Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.address.postalCode}
                                        onChange={(e) => handleChange(e, 'address')}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-beelittle-coral outline-none transition-all disabled:opacity-60"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.address.country}
                                        onChange={(e) => handleChange(e, 'address')}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-beelittle-coral outline-none transition-all disabled:opacity-60"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.address.phone}
                                        onChange={(e) => handleChange(e, 'address')}
                                        disabled={!isEditing}
                                        className="w-full mt-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-beelittle-coral outline-none transition-all disabled:opacity-60"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex justify-end gap-4 pt-6 border-t border-zinc-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-beelittle-coral text-white font-bold rounded-xl hover:bg-orange-500 transition-colors flex items-center gap-2"
                                >
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        )}

                        {/* Nav Buttons (Hidden when editing) */}
                        {!isEditing && (
                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-100">
                                <button
                                    type="button"
                                    onClick={() => navigate('/myorders')}
                                    className="col-span-1 bg-zinc-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
                                >
                                    <Package size={18} /> View My Orders
                                </button>
                                <button
                                    type="button"
                                    onClick={logoutHandler}
                                    className="col-span-1 bg-red-50 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                                >
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
