import axios from 'axios';
import DashboardNavbar from '../components/DashboardNavbar';
import React, { useState, useEffect } from 'react';
import { useAdminTheme } from '../context/AdminThemeContext';
import { useAuthContext } from '../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import { BsPersonCircle } from "react-icons/bs";
import SearchBar from '../components/adminSearchBar';
import { useLogout } from '../hooks/useLogout';

const AdminProfile = () => {
    const { user } = useAuthContext();
    const { darkMode } = useAdminTheme();
    const navigate = useNavigate();
    const baseURL = "http://localhost:5555";
    const [activeButton, setActiveButton] = useState('profile');
    const [searchQuery, setSearchQuery] = useState('');
    const [contact, setContact] = useState(user.contact);
    const [username, setUsername] = useState(user.username);
    const [name, setName] = useState(user.name);
    const [users, setUsers] = useState([]);
    const { logout } = useLogout();
    const [isEditable, setIsEditable] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const resetToUserData = () => {
        setName(user.name);
        setUsername(user.username);
        setContact(user.contact);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsEditable(false);
        setIsChangingPassword(false);
    };

    const saveChanges = async (endpoint, data, successMessage, errorMessage) => {
        try {
            await axios.patch(`${baseURL}${endpoint}`, data);
            console.log(successMessage);
        } catch (error) {
            console.error(errorMessage, error);
        }
    };
    
    const toggleChangePassword = async () => {
        if (isChangingPassword) {
            if (newPassword === confirmPassword) {
                await saveChanges(`/user/${user._id}/change-password`, { currentPassword, newPassword }, 'Password changed successfully.', 'Error changing password:');
            } else {
                console.error('Passwords do not match.');
            }
        }
        setIsChangingPassword(!isChangingPassword);
        if (isChangingPassword) resetToUserData();
    };
    
    const toggleEdit = async () => {
        if (isEditable) {
            await saveChanges(`/user/${user._id}`, { name, username, contact }, 'Profile updated successfully.', 'Error updating profile:');
        }
        setIsEditable(!isEditable);
        if (isEditable) resetToUserData();
    };
    
    

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${baseURL}/user`);
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, [baseURL]);

    const handleClick = (button) => {
        setActiveButton(button);
        resetToUserData();  // Reset any editing or password changes when switching tabs
    };

    const handleAddUserClick = () => {
        navigate('/addUser');
    };

    const handleViewUserClick = (userId) => {
        console.log("View User button clicked for user:", userId);
    };

    const handleDeleteUserClick = (userId) => {
        console.log("Delete User button clicked for user:", userId);
    };

    const getIconColor = (role) => {
        switch (role) {
            case 'admin':
                return darkMode ? 'text-red-600' : 'text-red-400';
            default:
                return darkMode ? 'text-gray-600' : 'text-gray-400';
        }
    };

    const onLogout = () => {
        console.log('Logging out...');
        logout();
    };

    return (
        <div className={`w-full h-full ${darkMode ? 'bg-light-BG' : 'bg-dark-BG'}`}>
            <DashboardNavbar />
            <div className={`pt-[70px] px-6 py-4 h-full`}>
                <div className='flex items-center justify-center py-5 flex-col h-full'>
                    <div className='flex w-full items-center justify-start'>
                        <h1 className={`w-full text-3xl font-bold ${darkMode ? 'text-light-TEXT' : 'text-dark-TEXT'}`}>Settings</h1>
                    </div>
                    <div className='w-full h-full flex'>
                        <div className="flex flex-col text-xl h-full w-[20%] items-start justify-start p-4">
                            <button onClick={() => handleClick('profile')} className={`p-2 bg-transparent ${activeButton === 'profile' ? 'text-light-ACCENT' : `${darkMode ? 'text-light-TEXT' : 'text-dark-TEXT'}`}`} >Profile</button>
                            <button onClick={() => handleClick('users')} className={`p-2 bg-transparent ${activeButton === 'users' ? 'text-light-ACCENT' : `${darkMode ? 'text-light-TEXT' : 'text-dark-TEXT'}`}`} >Users</button>
                        </div>
                        <div className={`flex-grow border-l h-full ${darkMode ? 'border-light-ACCENT' : 'border-dark-ACCENT'}`}></div>

                        <div className='flex flex-col w-[80%] items-start justify-start gap-6 p-8 pl-24'>
                            {activeButton === 'profile' && (
                                <>
                                    <p className={`text-xl ${darkMode ? 'text-light-TEXT' : 'text-dark-TEXT'}`}>Profile</p>
                                    <BsPersonCircle className={`w-20 h-20 ${darkMode ? 'text-light-ACCENT' : 'text-dark-ACCENT'}`} />
                                    {!isChangingPassword && !isEditable && (
                                        <>
                                            <p className={`text-4xl font-semibold ${darkMode ? 'text-light-TEXT' : 'text-dark-TEXT'}`}>{name}</p>
                                            <p className={`${darkMode ? 'text-light-ACCENT' : 'text-dark-ACCENT'}`}>{user.role.toUpperCase()}</p>
                                            <label className={`text-sm font-medium flex flex-col ${darkMode ? 'text-light-TEXT' : 'text-dark-TEXT'}`}>
                                                Username
                                                <input type="text"  value={username}  placeholder="Username" disabled className={`w-[100%] border bg-transparent rounded-md p-2 mt-1 ${darkMode ? 'border-light-ACCENT' : 'border-dark-ACCENT'}`} />
                                            </label>
                                            <label className={`text-sm font-medium flex flex-col ${darkMode ? 'text-light-TEXT' : 'text-dark-TEXT'}`}>
                                                Contact
                                                <input  type="text" value={contact} placeholder="Contact" disabled  className={`w-full border bg-transparent rounded-md p-2 mt-1 ${darkMode ? 'border-light-ACCENT' : 'border-dark-ACCENT'}`} />
                                            </label>
                                        </>
                                    )}
                                    {(isChangingPassword || isEditable) && (
                                        <div className='flex flex-col gap-4'>
                                            {(isEditable || !isChangingPassword) && (
                                                <>
                                                    <label className='text-sm font-medium'>
                                                        Name
                                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" disabled={!isEditable}  className={`w-full border bg-transparent rounded-md p-2 mt-1 ${darkMode ? 'border-light-ACCENT' : 'border-dark-ACCENT'}`} />
                                                    </label>
                                                    <label className='text-sm font-medium'>
                                                        Username
                                                        <input type="text"  value={username}  onChange={(e) => setUsername(e.target.value)}  placeholder="Username"  disabled={!isEditable}  className={`w-full border bg-transparent rounded-md p-2 mt-1 ${darkMode ? 'border-light-ACCENT' : 'border-dark-ACCENT'}`} />
                                                    </label>
                                                    <label className='text-sm font-medium'>
                                                        Contact
                                                        <input type="text" value={contact}  onChange={(e) => setContact(e.target.value)}  placeholder="Contact" disabled={!isEditable} className={`w-full border bg-transparent rounded-md p-2 mt-1 ${darkMode ? 'border-light-ACCENT' : 'border-dark-ACCENT'}`} />
                                                    </label>
                                                </>
                                            )}
                                            {isChangingPassword && (
                                                <>
                                                    <label className='text-sm font-medium'>
                                                        Current Password
                                                        <input type="password"  value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current Password"  className={`w-full border bg-transparent rounded-md p-2 mt-1 ${darkMode ? 'border-light-ACCENT' : 'border-dark-ACCENT'}`} />
                                                    </label>
                                                    <label className='text-sm font-medium'>
                                                        New Password
                                                        <input  type="password"  value={newPassword}  onChange={(e) => setNewPassword(e.target.value)}  placeholder="New Password" className={`w-full border bg-transparent rounded-md p-2 mt-1 ${darkMode ? 'border-light-ACCENT' : 'border-dark-ACCENT'}`}  />
                                                    </label>
                                                    <label className='text-sm font-medium'>
                                                        Confirm Password
                                                        <input  type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}  placeholder="Confirm Password" className={`w-full border bg-transparent rounded-md p-2 mt-1 ${darkMode ? 'border-light-ACCENT' : 'border-dark-ACCENT'}`} />
                                                    </label>
                                                </>
                                            )}
                                            <div className='flex gap-4'>
                                                <button onClick={isChangingPassword ? toggleChangePassword : toggleEdit} className={`px-4 py-2 rounded-md ${isChangingPassword ? 'bg-blue-500' : 'bg-blue-500'} text-white`} >
                                                    {isChangingPassword ? 'Save Password' : isEditable ? 'Save Info' : 'Edit Info'}
                                                </button>
                                                <button onClick={resetToUserData} className="px-4 py-2 rounded-md bg-gray-300 text-black" > Cancel </button>
                                            </div>
                                        </div>
                                    )}
                                    {!isChangingPassword && !isEditable && (
                                        <div className='flex flex-col gap-4'>
                                            <button onClick={toggleChangePassword} className={`px-4 py-2 rounded-md font-semibold ${darkMode ? 'bg-light-ACCENT' : 'bg-dark-ACCENT'}`}>Change Password</button>
                                            <div className='flex gap-4'>
                                                <button  onClick={() => setIsEditable(true)} className={`px-4 py-2 rounded-md font-semibold ${darkMode ? 'bg-light-ACCENT' : 'bg-dark-ACCENT'}`} >Edit Info</button>
                                                <button onClick={() => onLogout()} className={`px-4 py-2 rounded-md font-semibold ${darkMode ? 'bg-red-600 text-white' : 'bg-red-600 text-white'}`}>Logout</button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {activeButton === 'users' && (
                                <div className='w-full'>
                                    <div className='flex items-center justify-between'>
                                        <p className={`text-4xl ${darkMode ? 'text-light-TEXT' : 'text-dark-TEXT'}`}>Users</p>
                                        <div className='w-full flex justify-end gap-4 my-4'>
                                            <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
                                            <button
                                                className={`px-4 py-2 rounded-md font-semibold ${darkMode ? 'bg-light-ACCENT' : 'bg-dark-ACCENT'}`}
                                                onClick={handleAddUserClick}
                                            >
                                                Add User
                                            </button>
                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-2 w-full'>
                                        <div className={`w-full max-h-[480px] overflow-auto rounded-lg ${darkMode ? 'bg-light-CARD1' : 'bg-dark-CARD1'}`}>
                                            <table className='w-full border-collapse'>
                                                <thead className={`sticky top-0 rounded-lg py-6 ${darkMode ? 'border-light-ACCENT bg-light-CARD text-light-TEXT' : 'border-dark-ACCENT bg-dark-CARD text-dark-TEXT'}`}>
                                                    <tr>
                                                        <th style={{ width: '60%' }} className={`p-2 py-4 text-left`}>NAME</th>
                                                        <th style={{ width: '20%' }} className={`p-2 py-4 text-center`}>ROLE</th>
                                                        <th style={{ width: '20%' }} className={`p-2 py-4 text-center`}>ACTION</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase())).map(user => (
                                                        <tr key={user._id} className={`border-b ${darkMode ? 'border-light-ACCENT' : 'border-dark-ACCENT'}`}>
                                                            <td style={{ width: '50%' }} className={`p-2 py-4 flex gap-4 items-center justify-start ${darkMode ? 'text-light-TEXT' : 'text-dark-TEXT'}`}>
                                                                <BsPersonCircle className={`w-8 h-8 ${getIconColor(user.role)}`} />
                                                                <p>{user.name}</p>
                                                            </td>
                                                            <td style={{ width: '30%' }} className={`p-2 py-4 text-center ${darkMode ? 'text-light-TEXT' : 'text-dark-TEXT'}`}>{user.role}</td>
                                                            <td style={{ width: '20%' }} className='p-2 py-4 text-center flex gap-4'>
                                                                <button
                                                                    className={`px-4 py-2 rounded-md font-semibold ${darkMode ? 'bg-light-ACCENT' : 'bg-dark-ACCENT'}`}
                                                                    onClick={() => handleViewUserClick(user._id)}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    className={`px-4 py-2 rounded-md font-semibold ${darkMode ? 'bg-red-500' : 'bg-red-600'}`}
                                                                    onClick={() => handleDeleteUserClick(user._id)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminProfile;
