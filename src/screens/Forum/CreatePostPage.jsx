import React from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import PostForm from "../../components/Post/PostForm";

const styles = {
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
    },
    container: {
        maxWidth: '700px',
        width: '100%',
        padding: '30px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        backgroundColor: '#fff',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
    }
};

const CreatePostPage = () => {
    const navigate = useNavigate();

    

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <h1 style={styles.title}>Create New Post</h1>
                <PostForm/>
            </div>
        </div>
    );
};

export default CreatePostPage;
