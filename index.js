const selectAllCheckbox = document.getElementById('selectAll');
const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('searchInput');
const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');
const deleteSelectedButton = document.getElementById('deleteSelected');

let currentPage = 1;
const rowsPerPage = 10;
let filteredData = []
let data = [];

fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
    .then(response => response.json())
    .then(rawdata => {
        data = rawdata;

        const renderRows = () => {
            tableBody.innerHTML = '';
            const start = (currentPage - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            const dataSource = searchInput.value.trim() !== '' ? filteredData : data;

            for (let i = start; i < end && i < dataSource.length; i++) {
                const member = dataSource[i];
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox"></td>
                    <td class="editable" contenteditable="true">${member.name}</td>
                    <td class="editable" contenteditable="true">${member.email}</td>
                    <td class="editable" contenteditable="true">${member.role}</td>
                    <td>
                        <button class="edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            }
        };

        renderRows();

        searchInput.addEventListener('input', function () {
            currentPage = 1;
            filteredData = data.filter(member =>
                member.name.toLowerCase().includes(searchInput.value.toLowerCase()) ||
                member.email.toLowerCase().includes(searchInput.value.toLowerCase())
            );
            renderRows();
        });

        prevPageButton.addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage--;
                renderRows();
            }
        });

        nextPageButton.addEventListener('click', function () {
            const totalPages = Math.ceil((searchInput.value.trim() !== '' ? filteredData : data).length / rowsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderRows();
            }
        });

        selectAllCheckbox.addEventListener('change', function () {
            const checkboxes = tableBody.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });

        deleteSelectedButton.addEventListener('click', function () {
            const checkboxes = tableBody.querySelectorAll('input[type="checkbox"]:checked');
            checkboxes.forEach(checkbox => {
                const row = checkbox.closest('tr');
                const rowIndex = row.rowIndex - 1;
                row.remove();
                data.splice(rowIndex, 1);
            });
            renderRows();
        });

        tableBody.addEventListener('click', function (event) {
            const target = event.target;
            const row = target.closest('tr');
            const rowIndex = row.rowIndex - 1;

            if (target.classList.contains('edit')) {
                const editableCells = row.querySelectorAll('.editable');

                document.querySelectorAll('.editable[contenteditable="true"]').forEach(cell => {
                    cell.removeAttribute('contenteditable');
                });

                editableCells.forEach(cell => {
                    cell.setAttribute('contenteditable', 'true');
                });

                target.innerHTML = '<i class="fas fa-save"></i>';
                target.classList.remove('edit');
                target.classList.add('save');
            } else if (target.classList.contains('save')) {
                const editableCells = row.querySelectorAll('.editable');
                editableCells.forEach(cell => {
                    cell.removeAttribute('contenteditable');
                });

                target.innerHTML = '<i class="fas fa-edit"></i>';
                target.classList.remove('save');
                target.classList.add('edit');

                data[rowIndex].name = editableCells[0].textContent;
                data[rowIndex].email = editableCells[1].textContent;
                data[rowIndex].role = editableCells[2].textContent;
            } else if (target.classList.contains('delete')) {
                const isConfirmed = confirm('Are you sure you want to delete this row?');

                if (isConfirmed) {
                    row.remove();
                    data.splice(rowIndex, 1);
                    renderRows();
                }
            }
        });
    })
    .catch(error => console.error('Error fetching data:', error));
