## Demo 1: API Consistency & Best Practices (Context Optimization)

### **Developer Goal**
A developer is building new API endpoints for a **Node.js REST API** using an internal template repository. 
They want GitHub Copilot to help maintain consistency with existing API structures and enforce best practices.

### **AI Role** 
Copilot understands the existing API design by looking at existing API's in the project or alternatively is provided with guidelines -- see [Azure guidelines](https://github.com/microsoft/api-guidelines/tree/vNext/azure), enforces naming conventions, and ensures security and performance best practices.

### Demo Steps:
Developer asks Copilot to implement a new API Route.

**Prompt:**
> **@rest** I need to implement a new API route. It is an endpoint for creating a todo item. I need to log the creation as well. Also it should return the newly created todo item. Let's worry about security later.

**Copilot Response:**
- Correct route structure based on existing endpoints.
- Middleware that needs ot be applied (authentication and logging)
- Standard Response format
**Custom Linting & Best Practices**  
Copilot provides inline recommendations for security, error handling, and performance improvements (e.g., avoiding synchronous calls in Express.js).
**Key Takeaway:** 
By leveraging context-aware customization, Copilot ensures developers follow the company’s API standards without manually referencing documentation.  

## Demo 2: Automating API Contract Validation (Supervised Automation)
### **Developer Goal** 
The developer needs to **validate API contracts** against an OpenAPI (Swagger) specification. 
They have an existing script that runs `swagger-cli validate`, but it's difficult to integrate into their workflow.

### **AI Role** 
Copilot assists with executing and interpreting the results of the API contract validation script, making it easier to understand and act on.

### Demo Steps:
The developer asks Copilot to validate their API changes.  

**Prompt:**
> **@rest** Please validate the api against the OpenAPI spec (swagger) in the workspace.

**Copilot Response:**
Copilot executes `npm run validate-api`, which runs `swagger-cli validate` on the updated OpenAPI spec.  
If errors occur (e.g., missing required parameters, incorrect response types), Copilot interprets the error messages and explains them in natural language.  
Instead of just displaying raw CLI output, Copilot identifies which endpoint has issues and suggests a fix.  
Copilot offers a follow up action to fix there errors, which the developer accepts 

**Key Takeaway:** 
By integrating with existing tools, Copilot **removes friction from validation processes**, ensuring that APIs remain **compliant with specifications without manual debugging**.  

### Additional
**Prompts:**
> **@rest** I am supposed to implement the missing API endpoint according to the openAPI spec, can you help me?