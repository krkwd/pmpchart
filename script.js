document.addEventListener('DOMContentLoaded', () => {
    const pmpGrid = document.getElementById('pmp-grid');
    const bankList = document.getElementById('bank-list');
    let allProcesses = [];

    // Initialize the application
    async function init() {
        const response = await fetch('data.json');
        const data = await response.json();
        allProcesses = data.processes;
        setupGrid(data);
        populateBank(data.processes);
    }

    // Create the grid structure with headers and cells
    function setupGrid(data) {
        const { knowledgeAreas, processGroups } = data;
        // Grid columns: 1 for KA headers + number of PGs
        pmpGrid.style.gridTemplateColumns = `200px repeat(${processGroups.length}, 1fr)`;
        
        // Create empty top-left corner
        pmpGrid.appendChild(document.createElement('div'));

        // Create Process Group headers (top row)
        processGroups.forEach(pg => {
            const header = document.createElement('div');
            header.classList.add('grid-header');
            header.textContent = pg;
            pmpGrid.appendChild(header);
        });

        // Create Knowledge Area headers and data cells
        knowledgeAreas.forEach(ka => {
            // KA header (first column)
            const kaHeader = document.createElement('div');
            kaHeader.classList.add('grid-header');
            kaHeader.textContent = ka;
            pmpGrid.appendChild(kaHeader);

            // Data cells for the row
            processGroups.forEach(pg => {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.knowledgeArea = ka;
                cell.dataset.processGroup = pg;
                addDropListeners(cell);
                pmpGrid.appendChild(cell);
            });
        });
    }

    // Create the draggable process items in the bank
    function populateBank(processes) {
		    // --- START OF NEW CODE ---
    // Create a copy of the array to avoid changing the original order
    const shuffledProcesses = [...processes];

    // Shuffle the copied array using the Fisher-Yates algorithm
    for (let i = shuffledProcesses.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledProcesses[i], shuffledProcesses[j]] = [shuffledProcesses[j], shuffledProcesses[i]];
    }
    // --- END OF NEW CODE ---
		
        bankList.innerHTML = '';
		
		
		
    // Now, loop over the newly shuffled array instead of the original one
    shuffledProcesses.forEach(process => {
        const item = document.createElement('div');
        item.classList.add('process-item');
        item.id = process.id;
        item.textContent = process.name;
        item.draggable = true;
        addDragListeners(item);
        bankList.appendChild(item);
    });
}
    // Add drag listeners to a process item
    function addDragListeners(item) {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    }

    // Add drop listeners to a grid cell
    function addDropListeners(cell) {
        cell.addEventListener('dragover', handleDragOver);
        cell.addEventListener('dragleave', handleDragLeave);
        cell.addEventListener('drop', handleDrop);
    }

    // --- Event Handlers ---
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.target.classList.add('dragging');
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault(); // Necessary to allow dropping
        e.target.closest('.grid-cell').classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.target.closest('.grid-cell').classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        const targetCell = e.target.closest('.grid-cell');
        targetCell.classList.remove('drag-over');

        const processId = e.dataTransfer.getData('text/plain');
        const draggedElement = document.getElementById(processId);
        
        // Find the process data from our stored array
        const processData = allProcesses.find(p => p.id === processId);

        if (draggedElement && processData && targetCell) {
            // Check for correctness
            const isCorrect = 
                processData.correctLocation.knowledgeArea === targetCell.dataset.knowledgeArea &&
                processData.correctLocation.processGroup === targetCell.dataset.processGroup;
            
            draggedElement.classList.remove('correct', 'incorrect'); // Reset classes
            draggedElement.classList.add(isCorrect ? 'correct' : 'incorrect');
            
            targetCell.appendChild(draggedElement);
        }
    }

    // Start the app
    init();
});