import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './ConfirmActionPage.module.css';

// TypeScript interface to define the shape of data sent to the API
interface ActionPayload {
    actionType: string;
    requestId: string;
    intendedActorEmail: string;
    optionId: number | null;
    comments: string;
}

const ConfirmActionPage: React.FC = () => {
    // State to manage the page's current status and data
    const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'success' | 'error'>('loading');
    const [actionText, setActionText] = useState('');
    const [finalMessage, setFinalMessage] = useState('');
    const [comments, setComments] = useState('');
    const [showComments, setShowComments] = useState(false);
    
    // Hook from react-router-dom to easily read URL query parameters
    const [searchParams] = useSearchParams();
    
    // This effect runs once when the component first loads to parse the URL
    useEffect(() => {
        const action = searchParams.get('action');
        const requestId = searchParams.get('requestId');
        const intendedActor = searchParams.get('intendedActor');
        const optionId = searchParams.get('optionId');

        // Validate that we have the required parameters from the email link
        if (!action || !requestId || !intendedActor) {
            setStatus('error');
            setFinalMessage('Error: Invalid or incomplete link. Please check the link and try again.');
            return;
        }

        let dynamicText = '';
        if (action.includes('approve')) {
            dynamicText = `approve travel request ${requestId}`;
        } else if (action.includes('reject')) {
            dynamicText = `reject travel request ${requestId}`;
            setShowComments(true); // Show the comments box only for rejections
        } else if (action.includes('select-ticket')) {
            dynamicText = `select ticket option #${optionId} for request ${requestId}`;
        }

        setActionText(dynamicText);
        setStatus('ready');
    }, [searchParams]);

    // This function is called when the "Confirm" button is clicked
    const handleConfirm = async () => {
        setStatus('processing'); // Update UI to show we are working

        const payload: ActionPayload = {
            actionType: searchParams.get('action')!,
            requestId: searchParams.get('requestId')!,
            intendedActorEmail: searchParams.get('intendedActor')!,
            optionId: searchParams.get('optionId') ? parseInt(searchParams.get('optionId')!) : null,
            comments: comments,
        };

        try {
            // =========================================================================
            //  THE FIX IS HERE: We build the full URL to the backend API
            // =========================================================================
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/public-actions/perform`;

            // This console log is for debugging. It will show you the exact URL being called.
            console.log('Attempting to call API at:', apiUrl);

            const response = await fetch(apiUrl, { // <-- Use the full apiUrl here
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setStatus('success');
                setFinalMessage('Your action has been recorded successfully. You can now close this window.');
            } else {
                const errorData = await response.json();
                setStatus('error');
                setFinalMessage(`Failed to perform action. ${errorData.message || 'The server returned an error.'}`);
            }
        } catch (error) {
            setStatus('error');
            setFinalMessage('Network Error: Could not connect to the server. Please check your connection.');
        }
    };
    
    // Closes the current browser tab
    const handleCancel = () => {
        window.close();
    };
    
    // Render different content based on the current status
    const renderContent = () => {
        if (status === 'loading') {
            return <p>Loading action details...</p>;
        }

        if (status === 'success' || status === 'error') {
            return <p className={status === 'success' ? styles.success : styles.error}>{finalMessage}</p>;
        }
        
        return (
            <>
                <p>
                    You are about to <strong>{actionText}</strong>. <br /> Please confirm to proceed.
                </p>

                {showComments && (
                    <div className={styles.rejectionSection}>
                        <label htmlFor="comments">Please provide comments for rejection (optional):</label><br/>
                        <textarea 
                            id="comments" 
                            rows={3}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            disabled={status === 'processing'}
                        />
                    </div>
                )}

                <div className={styles.buttons}>
                    <button className={styles.confirmBtn} onClick={handleConfirm} disabled={status === 'processing'}>
                        {status === 'processing' ? 'Processing...' : 'Confirm'}
                    </button>
                    <button className={styles.cancelBtn} onClick={handleCancel} disabled={status === 'processing'}>
                        Cancel
                    </button>
                </div>
            </>
        );
    };

    return (
        <div className={styles.pageBody}>
            <div className={styles.container}>
                <h1>{status === 'success' ? 'Success!' : status === 'error' ? 'Error!' : 'Confirm Your Action'}</h1>
                {renderContent()}
            </div>
        </div>
    );
};

export default ConfirmActionPage;