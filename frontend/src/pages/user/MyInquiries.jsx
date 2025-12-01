import React, { useEffect, useState, useContext } from 'react';
import inquiryService from '../../services/inquiryService';
import { Mail } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

const MyInquiries = () => {
  const { user } = useContext(AuthContext);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyTexts, setReplyTexts] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const { showToast } = useToast();
  const containerRefs = React.useRef({});
  const lastMsgRefs = React.useRef({});

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Unknown';
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return 'Unknown';
    return d.toLocaleString();
  };

  const fetchMyInquiries = async () => {
    setLoading(true);
    try {
      const res = await inquiryService.getMyInquiries();
      const data = res.data ?? res;
      setInquiries(Array.isArray(data.inquiries) ? data.inquiries : (data || []));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load your inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyInquiries();
  }, []);

  const handleReplySubmit = async (inquiryId) => {
    const text = (replyTexts[inquiryId] || '').trim();
    if (!text) return;
    try {
      setSendingId(inquiryId);
      await inquiryService.addUserReply(inquiryId, { message: text });
      setReplyTexts(prev => ({ ...prev, [inquiryId]: '' }));
      setReplyingTo(null);
      showToast('Reply sent', 'success');
      await fetchMyInquiries();
      // scroll to bottom after sending
      setTimeout(() => {
        const el = lastMsgRefs.current[inquiryId];
        if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 150);
    } catch (err) {
      console.error('Reply failed', err);
      setError(err?.message || 'Failed to send reply');
      showToast(err?.message || 'Failed to send reply', 'error');
    } finally {
      setSendingId(null);
    }
  };

  if (loading) return (
    <div className="page-bg-auth min-h-screen flex items-center">
      <div className="p-8 w-full max-w-5xl mx-auto"><Loader /></div>
    </div>
  );

  return (
    <div className="page-bg-auth">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center ring-1 ring-white/20">
          <Mail className="w-6 h-6 text-black" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-black drop-shadow-sm">My Inquiries</h1>
          <p className="text-sm text-black/80">View inquiries you submitted and any responses from our team. You can add a follow-up reply below an inquiry.</p>
        </div>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {inquiries.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border border-gray-100 text-center shadow-sm">
          <p className="text-gray-600">You have no inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const lastAdmin = Array.isArray(inq.conversation) ? [...inq.conversation].reverse().find(c => c.sender === 'admin') : null;
            const lastUser = Array.isArray(inq.conversation) ? [...inq.conversation].reverse().find(c => c.sender === 'user') : null;
            const adminIsNewer = lastAdmin && lastUser ? new Date(lastAdmin.createdAt) > new Date(lastUser.createdAt) : !!lastAdmin && !lastUser;
            const isExpanded = true;

            return (
              <div key={inq._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold truncate">{inq.subject || 'No subject'}</h3>
                    <div className="text-sm text-gray-500">Submitted: {formatDate(inq.createdAt)}</div>
                    <div className="mt-3 text-gray-700 text-sm whitespace-pre-line">{inq.message}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm text-gray-600">Status: <span className="font-medium">{inq.status}</span></div>
                    {adminIsNewer && (
                      <div className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded-full">New reply</div>
                    )}
                    
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">Conversation</h4>
                    {Array.isArray(inq.conversation) && inq.conversation.length > 0 ? (
                      <div className="space-y-3 max-h-80 overflow-auto p-2" ref={el => (containerRefs.current[inq._id] = el)} role="list" aria-label={`Conversation for ${inq.subject || 'inquiry'}`}>
                        {inq.conversation.map((c, idx) => {
                          const isAdmin = c.sender === 'admin';
                          const isLast = idx === inq.conversation.length - 1;
                          return (
                            <div key={idx} role="listitem" ref={el => { if (isLast) lastMsgRefs.current[inq._id] = el; }} className={`p-3 rounded-lg max-w-[85%] ${isAdmin ? 'bg-gray-50 border border-gray-100 self-start text-gray-700' : 'bg-emerald-50 border border-emerald-100 self-end ml-auto text-gray-800'}`}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-sm font-medium text-gray-700">{isAdmin ? 'Admin' : (user?.name || 'You')}</div>
                                <div className="text-xs text-gray-400">{c.createdAt ? formatDate(c.createdAt) : ''}</div>
                              </div>
                              <div className="text-sm text-gray-700 whitespace-pre-wrap">{c.message}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">No conversation yet.</div>
                    )}

                    <div className="mt-2">
                      {replyingTo === inq._id ? (
                        <div className="space-y-2">
                          <label htmlFor={`reply-${inq._id}`} className="sr-only">Write a follow-up message</label>
                          <textarea
                            id={`reply-${inq._id}`}
                            value={replyTexts[inq._id] || ''}
                            onChange={(e)=>setReplyTexts(prev => ({ ...prev, [inq._id]: e.target.value }))}
                            className="w-full rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 placeholder-gray-500"
                            rows={3}
                            maxLength={2000}
                            placeholder="Write a follow-up message..."
                            aria-label="Write a follow-up message"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button variant="secondary" onClick={()=>{ setReplyingTo(null); setReplyTexts(prev => ({ ...prev, [inq._id]: '' })); }}>Cancel</Button>
                            <Button onClick={()=>handleReplySubmit(inq._id)} disabled={sendingId === inq._id || !(replyTexts[inq._id] && replyTexts[inq._id].trim().length > 0)}>
                              {sendingId === inq._id ? 'Sending...' : 'Send Reply'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <Button onClick={()=>{ setReplyingTo(inq._id); setReplyTexts(prev => ({ ...prev, [inq._id]: '' })); }} aria-label={`Reply to inquiry ${inq.subject || ''}`}>Reply</Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};

export default MyInquiries;
