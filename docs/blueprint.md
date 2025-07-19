# **App Name**: Security Compass

## Core Features:

- AI-Powered Risk Inference: Analyze newly ingested asset metadata using an LLM, with the LLM using its tool to check for potential risks, returning edge suggestions, and automatically updating the graph in Firestore.
- Interactive Graph Visualization: Display assets and their relationships visually on a main graph dashboard using a library like vis.js or cytoscape.js.
- Asset Detail View: Present detailed information about a selected asset (e.g., IAM roles, VPC configuration, associated risks, and historical data).
- Search and Filter Panel: Implement a search and filter panel for assets, allowing users to filter by asset type, tags, and risk level.
- Scan Ingestor: Enable triggering cloud asset discovery either via API connection to cloud platforms (e.g., AWS, Azure) or via manual JSON upload.

## Style Guidelines:

- Primary color: Deep blue (#1E3A8A), conveying security, trust, and stability. This color will dominate the app's interface to create a sense of authority and reliability, which aligns with its risk assessment functionality.
- Background color: Light gray (#F0F0F5), providing a clean, neutral backdrop that allows the primary color and data visualizations to stand out without causing eye strain.
- Accent color: Bright orange (#FF8C00), used strategically for key interactive elements such as call-to-action buttons and highlighted risk indicators. This creates contrast and directs the user's attention to critical areas within the interface.
- Body font: 'Inter', a grotesque-style sans-serif for a modern, neutral look; this will be used for the body text
- Headline font: 'Space Grotesk', a proportional sans-serif with a computerized, techy feel; use this for the headlines. 
- Use clear, easily recognizable icons to represent different asset types, relationships, and risk levels, enhancing the user's ability to quickly understand the information presented in the graph and detail views.
- Employ a modular layout with distinct panels for graph visualization, asset details, and filters, ensuring a clean, organized, and intuitive user experience.