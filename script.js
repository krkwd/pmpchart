document.addEventListener('DOMContentLoaded', () => {
    // Pre-load audio files
    const correctSound = new Audio('audio/correct.mp3');
    const incorrectSound = new Audio('audio/incorrect.mp3');

    // Get references to all the HTML elements
    const pmpGrid = document.getElementById('pmp-grid');
    const bankList = document.getElementById('bank-list');
    const incorrectCounterSpan = document.getElementById('incorrect-counter');
    const resetBtn = document.getElementById('reset-btn');

    let allProcesses = [];
    let incorrectCount = 0; 
    // ... (the rest of your file)

    // Initialize the application
    async function init() {
        const response = await fetch('data.json');
        const data = await response.json();
        allProcesses = data.processes;
        setupGrid(data);
        populateBank(data.processes);
        
        // NEW: Add event listener for the reset button
        resetBtn.addEventListener('click', resetGame);
    }
    
    // NEW: Function to reset the game state
    function resetGame() {
        // 1. Reset counter
        incorrectCount = 0;
        incorrectCounterSpan.textContent = incorrectCount;
        
        // 2. Clear all items from grid cells
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.innerHTML = '';
        });
        
        // 3. Re-populate and re-shuffle the bank
        populateBank(allProcesses);
    }

    // Create the grid structure with headers and cells
    function setupGrid(data) {
        pmpGrid.innerHTML = ''; // Clear grid before building
        const { knowledgeAreas, processGroups } = data;
		
        // Grid columns: 1 for KA headers + number of PGs
        pmpGrid.style.gridTemplateColumns = `200px repeat(${processGroups.length}, 1fr)`;
        
        // Create empty top-left corner
        pmpGrid.appendChild(document.createElement('div')).classList.add('grid-header');

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
            kaHeader.classList.add('grid-header', 'ka-header'); // Add class for potential specific styling
            kaHeader.style.left = 0; // Makes KA headers sticky
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

    // Create the draggable process items in the bank (with shuffling)
    function populateBank(processes) {
        const shuffledProcesses = [...processes];
        for (let i = shuffledProcesses.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledProcesses[i], shuffledProcesses[j]] = [shuffledProcesses[j], shuffledProcesses[i]];
        }
        
        bankList.innerHTML = '';
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
        const cell = e.target.closest('.grid-cell');
        if (cell) {
            cell.classList.add('drag-over');
        }
    }

    function handleDragLeave(e) {
        const cell = e.target.closest('.grid-cell');
        if (cell) {
            cell.classList.remove('drag-over');
        }
    }

function handleDrop(e) {
    e.preventDefault();
    const targetCell = e.target.closest('.grid-cell');
    if (!targetCell) return; // Dropped outside a valid cell

    targetCell.classList.remove('drag-over');

    const processId = e.dataTransfer.getData('text/plain');
    const draggedElement = document.getElementById(processId);
    
    const processData = allProcesses.find(p => p.id === processId);

    if (draggedElement && processData) {
        const isCorrect = 
            processData.correctLocation.knowledgeArea === targetCell.dataset.knowledgeArea &&
            processData.correctLocation.processGroup === targetCell.dataset.processGroup;
        
        draggedElement.classList.remove('correct', 'incorrect');

        // Check correctness and play the corresponding sound
        if (isCorrect) {
            draggedElement.classList.add('correct');
            correctSound.play(); // NEW: Play correct sound
        } else {
            draggedElement.classList.add('incorrect');
            incorrectCount++;
            incorrectCounterSpan.textContent = incorrectCount;
            incorrectSound.play(); // NEW: Play incorrect sound
        }
        
        targetCell.appendChild(draggedElement);
    }
}
    // Start the app
    init();
});