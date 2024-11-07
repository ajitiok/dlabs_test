"use client";

import React, { useState, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../services/fetch-users.service";
import SortTableIcon from "@/public/Sort-table.svg";
import SortTableUpIcon from "@/public/Sort-table-up.svg";
import SortTableDownIcon from "@/public/Sort-table-down.svg";

import Image from "next/image";

const columns = [
  { label: "Name", accessor: "firstName", sortable: true },
  { label: "Email", accessor: "email", sortable: true },
  { label: "Age", accessor: "age", sortable: true },
];

export default function Home() {
  const [sortBy, setSortBy] = useState("firstName");
  const [sortOrder, setSortOrder] = useState("asc");

  const [status, setStatus] = useState("");

  const [isOpenEditForm, setIsOpenEditForm] = useState<boolean>(false);
  const [isOpenAddForm, setIsOpenAddForm] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<Array<{ id: number; [key: string]: any }>>(
    []
  );

  const [selectedUser, setSelectedUser] = useState<{
    id: number;
    firstName: string;
    email: string;
    age: number;
    role: string;
  } | null>(null);

  // Fetch users from local storage when the component mounts and set up the query
  useEffect(() => {
    const localData = localStorage.getItem("usersData");
    if (localData) {
      setUsers(JSON.parse(localData));
    }
  }, []);

  const payload = {
    sortBy: sortBy,
    order: sortOrder,
  };

  useQuery(["users", JSON.stringify(payload)], () => {
    const localData = localStorage.getItem("usersData");
    if (localData && localData?.length !== 0) {
      return JSON.parse(localData);
    } else {
      return fetchUsers(payload).then((fetchedData) => {
        localStorage.setItem("usersData", JSON.stringify(fetchedData.users));
        setUsers(fetchedData.users);
        return fetchedData.users;
      });
    }
  });

  const handleSortingChange = (accessor: string) => {
    const sortOrderBy =
      accessor === sortBy && sortOrder === "ASC" ? "DESC" : "ASC";
    setSortBy(accessor);
    setSortOrder(sortOrderBy);
  };

  const handleDelete = (id: number) => {
    const localData = localStorage.getItem("usersData");

    if (localData) {
      const users = JSON.parse(localData);

      if (Array.isArray(users)) {
        const updatedUsers = users.filter((user) => user.id !== id); // Filter out the user with the specified ID
        localStorage.setItem("usersData", JSON.stringify(updatedUsers));
        setUsers(updatedUsers); // Update the local state to reflect the changes
      } else {
        console.error("Users data is not an array:", users);
      }
    }
  };

  const handleEdit = (id: number) => {
    const userToEdit = users.find((user) => user.id === id);
    if (userToEdit) {
      setSelectedUser({
        id: userToEdit.id,
        firstName: userToEdit.firstName,
        email: userToEdit.email,
        age: userToEdit.age,
        role: userToEdit.role, // Added role to the selected user object
      });
      setIsOpenEditForm(true);
    } else {
      console.error("User not found with ID:", id);
    }
  };

  const handleSave = () => {
    if (selectedUser) {
      // Validation logic
      if (
        !selectedUser.firstName ||
        !selectedUser.email ||
        !selectedUser.age ||
        !selectedUser.role
      ) {
        alert("Please fill in all fields correctly.");
        return; // Exit the function if validation fails
      }

      const localData = localStorage.getItem("usersData");
      if (localData) {
        const users = JSON.parse(localData) as { id: number }[];
        const updatedUsers = users.map((user) =>
          user.id === selectedUser.id ? selectedUser : user
        );
        localStorage.setItem("usersData", JSON.stringify(updatedUsers));
        setUsers(updatedUsers); // Update local state
      }
      setIsOpenEditForm(false);
    }
  };

  const handleAddUser = () => {
    // Validation logic
    if (!selectedUser?.firstName) {
      alert("Name is required.");
      return;
    }
    if (!selectedUser?.email || !/\S+@\S+\.\S+/.test(selectedUser.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (selectedUser?.age <= 1) {
      alert("Age must be greater than 1.");
      return;
    }
    if (!selectedUser?.role) {
      alert("Role is required.");
      return;
    }

    // Create a new user object
    const newUser = {
      id: Date.now(),
      firstName: selectedUser.firstName,
      email: selectedUser.email,
      age: selectedUser.age,
      role: selectedUser.role, // Menambahkan role ke objek pengguna baru
    };

    const localData = localStorage.getItem("usersData");

    if (localData) {
      const users = JSON.parse(localData);
      users.push(newUser); // Add the new user to the existing users array
      localStorage.setItem("usersData", JSON.stringify(users)); // Update local storage
      setUsers(users); // Update local state
    } else {
      localStorage.setItem("usersData", JSON.stringify([newUser])); // If no data, create a new array
      setUsers([newUser]); // Update local state
    }

    // Reset selectedUser to clear the form fields
    setSelectedUser({
      id: 0,
      firstName: "",
      email: "",
      age: 0,
      role: "", // Reset role to empty
    });

    setIsOpenAddForm(false); // Close the add form
  };

  const filteredUsers = status
    ? users.filter((user) => user.role === status) // Filter users by selected status
    : users; // If no status is selected, show all users

  return (
    <section className="mt-5 container px-5">
      <h1>Data Tech</h1>
      <div className="flex justify-between">
        <button
          onClick={() => setIsOpenAddForm(true)}
          className="mt-4 bg-green-500 text-white p-2"
        >
          Add User
        </button>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
          }}
          className="border p-2"
        >
          <option value="">All</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      <table className="w-full mt-2 ">
        <thead className="border-b">
          <tr>
            {columns.map(({ label, accessor, sortable }) => {
              const sortingIcon = sortable
                ? sortBy === accessor && sortOrder === "DESC"
                  ? SortTableUpIcon
                  : sortBy === accessor && sortOrder === "ASC"
                  ? SortTableDownIcon
                  : SortTableIcon
                : SortTableIcon;
              return (
                <th
                  scope="col"
                  key={accessor}
                  className={
                    "border border-slate-600 p-3 text-left font-normal"
                  }
                >
                  <div className="flex items-center">
                    {label}
                    <span
                      onClick={() =>
                        sortable ? handleSortingChange(accessor) : null
                      }
                      className="cursor-pointer"
                    >
                      <Image
                        src={sortingIcon}
                        alt=".sort"
                        className="px-1"
                        width={20}
                        height={20}
                      />
                    </span>
                  </div>
                </th>
              );
            })}
            <th className="border border-slate-600 p-3 text-left font-normal">
              Status
            </th>
            <th className="border border-slate-600 p-3 text-left font-normal">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td className="border border-slate-700 p-3">{user.firstName}</td>
              <td className="border border-slate-700 p-3">{user.email}</td>
              <td className="border border-slate-700 p-3">{user.age}</td>
              <td className="border border-slate-700 p-3">
                {user.role === "admin" ? "true" : "false"}
              </td>
              <td className="border border-slate-600 p-3">
                <div className="w-[200px] overflow-hidden rounded-md border border-black">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="w-full border-b border-base-200 py-3 px-4 text-left"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => handleEdit(user.id)}
                    className="w-full border-b border-base-200 py-3 px-4 text-left"
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isOpenAddForm && (
        <form className="mt-4">
          <h2>Add User</h2>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={selectedUser?.firstName || ""}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  firstName: e.target.value,
                  id: selectedUser?.id || 0,
                  email: selectedUser?.email || "",
                  age: selectedUser?.age || 0,
                  role: selectedUser?.role || "", // Ensuring role is always a string
                })
              }
              className="border p-2"
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={selectedUser?.email || ""}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  email: e.target.value,
                  id: selectedUser?.id || 0,
                  firstName: selectedUser?.firstName || "",
                  age: selectedUser?.age || 0,
                  role: selectedUser?.role || "", // Ensuring role is always a string
                })
              }
              className="border p-2"
              required
            />
          </div>
          <div>
            <label>Age:</label>
            <input
              type="number"
              value={selectedUser?.age || 0}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  age: parseInt(e.target.value),
                  id: selectedUser?.id || 0,
                  firstName: selectedUser?.firstName || "",
                  email: selectedUser?.email || "",
                  role: selectedUser?.role || "", // Ensuring role is always a string
                })
              }
              className="border p-2"
              required
              min="1" // Minimum age validation
            />
          </div>
          <div>
            <label>Status:</label>
            <select
              value={selectedUser?.role || ""}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  role: e.target.value,
                  id: selectedUser?.id || 0,
                  firstName: selectedUser?.firstName || "",
                  email: selectedUser?.email || "",
                  age: selectedUser?.age || 0,
                })
              }
              className="border p-2"
              required
            >
              <option value="">Select Status</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              // Validation logic
              if (
                !selectedUser?.firstName ||
                !selectedUser?.email ||
                !selectedUser?.age ||
                !selectedUser?.role
              ) {
                alert("Please fill in all fields correctly.");
                return;
              }
              handleAddUser();
            }}
            className="mt-2 bg-blue-500 text-white p-2"
          >
            Save
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpenAddForm(false);
            }}
            className="mt-2 ml-2 bg-blue-500 text-white p-2"
          >
            Cancel
          </button>
        </form>
      )}

      {isOpenEditForm && (
        <form className="mt-4">
          <h2>Edit User</h2>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={selectedUser?.firstName || ""}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  firstName: e.target.value,
                  id: selectedUser?.id || 0,
                  email: selectedUser?.email || "",
                  age: selectedUser?.age || 0,
                  role: selectedUser?.role || "", // Ensuring role is always a string
                })
              }
              className="border p-2"
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={selectedUser?.email || ""}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  email: e.target.value,
                  id: selectedUser?.id || 0,
                  firstName: selectedUser?.firstName || "",
                  age: selectedUser?.age || 0,
                  role: selectedUser?.role || "", // Ensuring role is always a string
                })
              }
              className="border p-2"
            />
          </div>
          <div>
            <label>Age:</label>
            <input
              type="number"
              value={selectedUser?.age || 0}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  age: parseInt(e.target.value),
                  id: selectedUser?.id || 0,
                  firstName: selectedUser?.firstName || "",
                  email: selectedUser?.email || "",
                  role: selectedUser?.role || "", // Ensuring role is always a string
                })
              }
              className="border p-2"
            />
          </div>
          <div>
            <label>Status:</label>
            <select
              value={selectedUser?.role || ""}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  role: e.target.value,
                  id: selectedUser?.id || 0,
                  firstName: selectedUser?.firstName || "",
                  email: selectedUser?.email || "",
                  age: selectedUser?.age || 0,
                })
              }
              className="border p-2"
            >
              <option value="">Select Status</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="mt-2 bg-blue-500 text-white p-2"
          >
            Update
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpenEditForm(false);
            }}
            className="mt-2 ml-2 bg-blue-500 text-white p-2"
          >
            Cancel
          </button>
        </form>
      )}
    </section>
  );
}
