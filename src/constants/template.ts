export const templates = [
    {
        id: "blank",
        label: "Blank Document",
        imageUrl: "/blank-document.svg",
        initialContent: ""
    },
    {
        id: "software-proposal",
        label: "Software Development Proposal",
        imageUrl: "/software-proposal.svg",
        initialContent: `
        <h1>Software Development Proposal</h1>
        <h2>Project Overview</h2>
        <p>Brief description of the proposed software development project.</p>

        <h2>Scope of Work</h2>
        <p>Detailed breakdown of project deliverables and requirements.</p>
        
        <h2>Timeline</h2>
        <p>Project milestones and delivery schedule.</p>
        
        <h2>Budget</h2>
        <p>Cost breakdown and payment terms.</p>`
    },
    {
        id: "project-proposal",
        label: "Project Proposal",
        imageUrl: "/project-proposal.svg",
        initialContent: `
        <h1>Project Proposal</h1>

        <h2>Project Overview</h2>
        <p>Brief description of the proposed project, including objectives and goals.</p>

        <h2>Scope of Work</h2>
        <p>Detailed breakdown of project deliverables, requirements, and boundaries of the work.</p>

        <h2>Methodology / Approach</h2>
        <p>Outline of the approach, tools, or methodology that will be used to complete the project.</p>

        <h2>Timeline</h2>
        <p>Key milestones, phases, and expected delivery schedule.</p>

        <h2>Budget</h2>
        <p>Estimated costs, payment terms, and resource allocation.</p>

        <h2>Team & Responsibilities</h2>
        <p>Project team members, their roles, and responsibilities.</p>

        <h2>Expected Outcomes</h2>
        <p>Measurable results, benefits, or deliverables the project will produce.</p>

        <h2>Conclusion</h2>
        <p>Final remarks, summary of proposal, and call to action (e.g., approval or next steps).</p>

        `
    },
    {
        id: "business-letter",
        label: "Business Letter",
        imageUrl: "/business-letter.svg",
        initialContent: `
        <h1>Business Letter</h1>
        <h2>Sender Information</h2>
        <p>Name, Title, Company, Address, Contact details.</p>

        <h2>Date</h2>
        <p>Insert date here.</p>

        <h2>Recipient Information</h2>
        <p>Name, Title, Company, Address.</p>

        <h2>Subject</h2>
        <p>Subject of the letter.</p>

        <h2>Body</h2>
        <p>Introduction paragraph stating purpose of the letter.</p>
        <p>Body paragraphs elaborating details, context, or requests.</p>
        <p>Closing paragraph with next steps, thanks, or call to action.</p>

        <h2>Closing</h2>
        <p>Sincerely, <br> Sender’s Name</p>`
    },
    {
        id: "resume", 
        label: "Resume", 
        imageUrl: "/resume.svg", 
        initialContent: `
        <h1>Resume</h1>
        <h2>Contact Information</h2>
        <p>Name, Email, Phone, Address, LinkedIn/GitHub.</p>

        <h2>Professional Summary</h2>
        <p>Brief 2–3 sentences summarizing experience, skills, and career goals.</p>

        <h2>Skills</h2>
        <p>List of key skills relevant to the role.</p>

        <h2>Work Experience</h2>
        <p>Company Name – Job Title (Start Date – End Date)</p>
        <p>• Key responsibility or achievement</p>
        <p>• Key responsibility or achievement</p>

        <h2>Education</h2>
        <p>Degree, University – Graduation Year</p>
        <p>Relevant coursework or honors.</p>

        <h2>Projects</h2>
        <p>Project Title – Short description of tools/impact.</p>
        ` 
    },
    {
        id: "cover-letter", 
        label: "Cover Letter", 
        imageUrl: "/cover-letter.svg", 
        initialContent: `
        <h1>Cover Letter</h1>
        <h2>Sender Information</h2>
        <p>Name, Address, Email, Phone.</p>

        <h2>Date</h2>
        <p>Insert date here.</p>

        <h2>Recipient Information</h2>
        <p>Hiring Manager's Name, Company, Address.</p>

        <h2>Introduction</h2>
        <p>Opening statement about the role you are applying for and how you found it.</p>

        <h2>Body</h2>
        <p>Paragraph highlighting skills, experience, and achievements relevant to the role.</p>
        <p>Paragraph connecting your skills to the company's mission/needs.</p>

        <h2>Closing</h2>
        <p>Thank the reader, express interest in an interview, and restate enthusiasm.</p>
        <p>Sincerely, <br> Your Name</p>` 
    },
    {
        id: "letter", 
        label: "Letter", 
        imageUrl: "/letter.svg", 
        initialContent: `
        <h1>Letter</h1>
        <h2>Sender Information</h2>
        <p>Name, Address, Contact details.</p>

        <h2>Date</h2>
        <p>Insert date here.</p>

        <h2>Recipient Information</h2>
        <p>Name, Address.</p>

        <h2>Body</h2>
        <p>Opening paragraph stating purpose of the letter.</p>
        <p>Body content with details or message.</p>
        <p>Closing paragraph summarizing message or next steps.</p>

        <h2>Closing</h2>
        <p>Sincerely, <br> Your Name</p>` 
    },
];