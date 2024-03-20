import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import TextBox from './TextBox';
import { useAuth } from './AuthContext';

function ProjectPage() {
    let navigate = useNavigate();
    const { user, signOut, updateProject } = useAuth();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [projectId, setProjectId] = useState('');
    const [hwSet1Capacity, setHWSet1Capacity] = useState('');
    const [hwSet2Capacity, setHWSet2Capacity] = useState('');
    const [message, setMessage] = useState('');
    const [inputError, setInputError] = useState('');
    const fields = [name, description, projectId, hwSet1Capacity, hwSet2Capacity];
    const onlyNumbers = /^\d+$/;

    const handleSignOut = () => {
        signOut();
        navigate('/');
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
    };
    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };
    const handleProjectIdChange = (event) => {
        setProjectId(event.target.value);
    };

    const handleHWSet1Change = (event) => {
        setHWSet1Capacity(event.target.value);
    };

    const handleHWSet2Change = (event) => {
        setHWSet2Capacity(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // setMessage("HandleSubmit called");
    };

    const createProject = async () => {
        const response = await fetch('http://localhost:5000/create-project', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId, name, description, hwSet1Capacity, hwSet2Capacity})
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Default project creation error');
        }
        return data;
    };

    const loginToProject = async () => {
        const response = await fetch('http://localhost:5000/use-project', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Default project use error');
        }
        return data;
    }

    // check if project id is valid with exactly 5 digits
    const validateProjectId = () => {
        if (projectId.length !== 5 || !onlyNumbers.test(projectId)) {
            setInputError("Project ID must be exactly 5 digits long.");
            return false;
        }
        return true;
    }

    const handleCreateNewProject = async(event) => {
        setMessage("Create New Project button clicked");

        // Check if all fields are valid
        const allFieldsFilled = fields.every(field => field.trim() !== '');
        if (!allFieldsFilled) {
            setInputError("All fields must be filled out.");
            return;
        }
        if (!validateProjectId()) {
            return;
        }
        if (!onlyNumbers.test(hwSet1Capacity) || !onlyNumbers.test(hwSet2Capacity) || hwSet1Capacity === '0' || hwSet2Capacity === '0') {
            setInputError("Initial capacities for HW Set #1 and HW Set #2 must be valid numbers.");
            return;
        }


        try {
            const projectData = await createProject();
            setMessage(projectData.message);

            // set context for checkout page
            updateProject(projectData);

            navigate('/checkout');
        } catch (error) {
            setInputError(error.message);
            console.error(error);
        }
    };

        
    const handleUseExistingProject = async(event) => {
        setMessage("Use Existing Project button clicked");
        if (!validateProjectId()) {
            return;
        }

        try {
            const projectData = await loginToProject();
            setMessage(projectData.message);

            // set context for checkout page
            updateProject(projectData);

            navigate('/checkout');
        } catch (error) {
            setInputError(error.message);
            console.error(error);
        }
    };

    return (
        <div className="project-page">
            <div className="page-title">Project Page</div>
            <div className="text-container">
                <p>Welcome <strong>{user.user}</strong>! Fill out all fields to create a new project or enter Project ID to log into an existing one.</p>
            </div>
            <form onSubmit={handleSubmit} className="form-container">
                <TextBox label="Project ID" value={projectId} onChange={handleProjectIdChange} type="text" placeholder="12345"/>
                <TextBox label="Name" value={name} onChange={handleNameChange} type="text" placeholder="ECE 461L project"/>
                <TextBox label="Description" value={description} onChange={handleDescriptionChange} type="text" placeholder="HW checkout application"/>
                <TextBox label="HW Set #1 Capacity" value={hwSet1Capacity} onChange={handleHWSet1Change} type="text" placeholder="10"/>
                <TextBox label="HW Set #2 Capacity" value={hwSet2Capacity} onChange={handleHWSet2Change} type="text" placeholder="100"/>
                <Button label="Create New Project" onClick={handleCreateNewProject} />
                <Button label="Use Existing Project" onClick={handleUseExistingProject} />
            </form>
            <div>
                {inputError && <p className="error-message">{inputError}</p>}
                {/* <p>{message}</p> */}
            </div>

            <div className="navigate-buttons">
                <Button label="Sign out" onClick={handleSignOut} type="button" />
            </div>
        </div>
    );
}

export default ProjectPage;
