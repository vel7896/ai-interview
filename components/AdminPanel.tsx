import React, { useState, useEffect } from 'react';
import { StoredUser, InterviewRecord } from '../types';
import { getUsers, loadInterviewHistory, updateUserPassword, deleteUserByEmail } from '../backend/api';
import Card from './ui/Card';
import Button from './ui/Button';
import { UsersIcon, TrashIcon, KeyIcon } from './ui/icons';
import Spinner from './ui/Spinner';

const calculateScore = (record: InterviewRecord): number => {
    if (!record) return 0;

    const questionScores = record.interviewData
        .map(data => data.feedback?.scores)
        .filter((scores): scores is Exclude<typeof scores, null> => scores != null)
        .map(scores => (scores.clarity + scores.relevance + scores.structure) / 3);

    const avgQuestionScore = questionScores.length > 0
        ? questionScores.reduce((sum, score) => sum + score, 0) / questionScores.length
        : 0;

    let codingScore = 0;
    let hasCodingChallenge = false;
    if (record.finalReport.codingChallengeFeedback) {
        const feedback = record.finalReport.codingChallengeFeedback;
        codingScore = (feedback.correctness + feedback.efficiency + feedback.style) / 3;
        hasCodingChallenge = true;
    }

    let finalScoreOutOf10 = 0;
    if (hasCodingChallenge && questionScores.length > 0) {
        // Weighting: 60% questions, 40% coding
        finalScoreOutOf10 = (avgQuestionScore * 0.6) + (codingScore * 0.4);
    } else if (questionScores.length > 0) {
        finalScoreOutOf10 = avgQuestionScore;
    } else if (hasCodingChallenge) {
        finalScoreOutOf10 = codingScore;
    }

    return Math.round(finalScoreOutOf10 * 10);
};


const AdminPanel: React.FC = () => {
    const [users, setUsers] = useState<StoredUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userHistories, setUserHistories] = useState<Record<string, InterviewRecord[]>>({});
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<StoredUser | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const allUsers = await getUsers();
            const regularUsers = allUsers.filter(u => u.email !== 'admin@admin.com');
            setUsers(regularUsers);

            const histories: Record<string, InterviewRecord[]> = {};
            for (const user of regularUsers) {
                histories[user.email] = await loadInterviewHistory(user);
            }
            setUserHistories(histories);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const showFeedback = (message: string) => {
        setFeedbackMessage(message);
        setTimeout(() => setFeedbackMessage(null), 3000);
    };

    const closeModals = () => {
        setShowPasswordModal(false);
        setShowDeleteConfirm(false);
        setSelectedUser(null);
        setNewPassword('');
    };
    
    const handleOpenPasswordModal = (user: StoredUser) => {
        setSelectedUser(user);
        setNewPassword('');
        setShowPasswordModal(true);
    };

    const handleOpenDeleteConfirm = (user: StoredUser) => {
        setSelectedUser(user);
        setShowDeleteConfirm(true);
    };

    const handleDeleteUser = async () => {
        if (selectedUser) {
            await deleteUserByEmail(selectedUser.email);
            setUsers(users.filter(u => u.email !== selectedUser.email));
            showFeedback(`User ${selectedUser.name} deleted successfully.`);
        }
        closeModals();
    };

    const handleChangePassword = async () => {
        if (selectedUser && newPassword.trim()) {
            await updateUserPassword(selectedUser.email, newPassword.trim());
            setUsers(users.map(u => u.email === selectedUser.email ? { ...u, password: newPassword.trim() } : u));
            showFeedback(`Password for ${selectedUser.name} updated successfully.`);
        }
        closeModals();
    };


    return (
        <div className="animate-fade-in space-y-8">
            <Card>
                <div className="p-6 md:p-8">
                    <div className="flex items-center mb-6">
                        <div className="p-3 bg-slate-700 rounded-full mr-4">
                            <UsersIcon className="w-7 h-7 text-cyan-400" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Control Panel</h1>
                    </div>
                    {isLoading ? (
                         <div className="flex justify-center py-12">
                            <Spinner />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-slate-300">
                                <thead className="bg-slate-700/50 text-xs text-slate-400 uppercase">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Name</th>
                                        <th scope="col" className="px-6 py-3">Email</th>
                                        <th scope="col" className="px-6 py-3">Password</th>
                                        <th scope="col" className="px-6 py-3 text-center">Attempts</th>
                                        <th scope="col" className="px-6 py-3 text-center">Latest Score (/100)</th>
                                        <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => {
                                        const history = userHistories[user.email] || [];
                                        const latestRecord = history[0];
                                        const score = latestRecord ? calculateScore(latestRecord) : 'N/A';
                                        return (
                                            <tr key={user.email} className="bg-slate-800/60 border-b border-slate-700 hover:bg-slate-800 transition-colors">
                                                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{user.name}</td>
                                                <td className="px-6 py-4">{user.email}</td>
                                                <td className="px-6 py-4 font-mono text-sm text-slate-400">{user.password}</td>
                                                <td className="px-6 py-4 text-center">{history.length}</td>
                                                <td className="px-6 py-4 text-center font-semibold text-lg">{score}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => handleOpenPasswordModal(user)} className="p-2 text-slate-400 hover:text-cyan-400 rounded-md transition-colors" aria-label="Change Password">
                                                            <KeyIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => handleOpenDeleteConfirm(user)} className="p-2 text-slate-400 hover:text-red-400 rounded-md transition-colors" aria-label="Delete User">
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {users.length === 0 && (
                                <p className="text-center py-12 text-slate-400">No user data found.</p>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            {showPasswordModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
                    <Card className="w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4 text-white">Change Password for {selectedUser.name}</h2>
                            <input
                                type="text"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200 text-white"
                                aria-label="New Password"
                            />
                            <div className="flex gap-4 mt-6">
                                <Button onClick={handleChangePassword} className="flex-1" disabled={!newPassword.trim()}>
                                    Save Password
                                </Button>
                                <Button onClick={closeModals} variant="secondary" className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {showDeleteConfirm && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
                    <Card className="w-full max-w-md">
                        <div className="p-6 text-center">
                            <h2 className="text-xl font-bold mb-2 text-white">Confirm Deletion</h2>
                            <p className="text-slate-400 mb-6">
                                Are you sure you want to delete the user <span className="font-semibold text-white">{selectedUser.name}</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <Button onClick={handleDeleteUser} variant="danger" className="flex-1">
                                    Yes, Delete User
                                </Button>
                                <Button onClick={closeModals} variant="secondary" className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
            
            {feedbackMessage && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                    {feedbackMessage}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
