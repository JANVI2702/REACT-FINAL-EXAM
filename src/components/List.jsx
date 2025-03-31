import React, { useEffect, useState } from "react";
import Table from "react-bootstrap/Table";
import { ToastContainer, toast } from "react-toastify";
import { FaSort, FaSortUp, FaSortDown , FaTrash} from "react-icons/fa"; 
import "react-toastify/dist/ReactToastify.css";

function List() {
    const [data, setData] = useState([]); 
    const [search, setSearch] = useState(""); 
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc"); 
    const itemsPerPage = 5; 

    useEffect(() => {
        getTableData();
    }, []); 

    const getTableData = async () => {
        try {
            let response = await fetch("http://localhost:3000/posts");
            let result = await response.json();
            setData(result || []); 
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Failed to fetch data");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        
        try {
            let response = await fetch(`http://localhost:3000/posts/${id}`, { method: "DELETE" });

            if (response.ok) {
                setData((prevData) => prevData.filter((user) => user.id !== id));
                toast.success("Data Deleted Successfully");
            } else {
                toast.error("Failed to delete data");
            }
        } catch (error) {
            console.error("Delete Error:", error);
            toast.error("Something went wrong while deleting");
        }
    };

    const filteredData = data.filter((user) => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.phone.toLowerCase().includes(search.toLowerCase())
    );

    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortField) return 0;
        let valueA = a[sortField];
        let valueB = b[sortField];

        if (sortField === "image") {
            valueA = valueA || "";
            valueB = valueB || "";
        }

        return sortOrder === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedData = sortedData.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleSort = (field) => {
        setSortField(field);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };

    const getSortIcon = (field) => {
        if (sortField === field) {
            return sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />;
        }
        return <FaSort />;
    };

    return (
        <div className="p-4">
            <h1>DATA TABLE</h1>

            <p>/* Click on Name or Image column to sort */</p>
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search by Name, Email, or Phone"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                }}
            />

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                            Name {getSortIcon("name")}
                        </th>
                        <th onClick={() => handleSort("image")} style={{ cursor: "pointer" }}>
                            Image {getSortIcon("image")}
                        </th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.length > 0 ? (
                        paginatedData.map((v, i) => (
                            <tr key={v.id}>
                                <td>{v.id}</td>
                                <td>{v.name}</td>
                                <td>
                                    <img src={v.image} alt="image" style={{ width: 50, height: 50 }} />
                                </td>
                                <td>{v.email}</td>
                                <td>{v.phone}</td>
                                <td>
                                   <button 
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(v.id)}
                                        title="Delete"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No Matching Data Found</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            <div className="d-flex justify-content-between">
                <button className="btn btn-primary" onClick={prevPage} disabled={currentPage === 1}>
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button className="btn btn-primary" onClick={nextPage} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>

            <ToastContainer />
        </div>
    );
}

export default List;
