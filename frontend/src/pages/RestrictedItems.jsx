import { useEffect, useState } from "react";
import {
  FaBoxOpen,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import Layout from "../components/Layout";
import api from "../services/api";

function RestrictedItems() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Restricted");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get("/restricted-items");
      setItems(res.data.items);
    } catch (error) {
      console.error(error);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();

    try {
      await api.post("/restricted-items", {
        name,
        description,
        category,
      });

      setName("");
      setDescription("");
      setCategory("Restricted");

      fetchItems();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/restricted-items/${id}`);
      fetchItems();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">
          Restricted Items
        </h1>

        <p className="text-slate-500 mt-2">
          Manage prohibited and restricted items for BringBuddy.
        </p>
      </div>

      {/* Add Item */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-5">
          Add New Item
        </h2>

        <form
          onSubmit={addItem}
          className="grid md:grid-cols-2 gap-5"
        >
          <input
            className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <select
            className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Restricted</option>
            <option>Dangerous</option>
            <option>Fragile</option>
            <option>Prohibited</option>
          </select>

          <textarea
            className="border rounded-xl p-3 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            required
          />

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-3 flex items-center justify-center gap-2 transition"
            type="submit"
          >
            <FaPlus />
            Add Item
          </button>
        </form>
      </div>

      {/* Items */}
      <div className="grid lg:grid-cols-2 gap-6">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border p-10 text-center col-span-2">
            <FaBoxOpen className="mx-auto text-5xl text-slate-300 mb-4" />

            <h2 className="text-xl font-semibold">
              No Restricted Items
            </h2>

            <p className="text-slate-500 mt-2">
              Add your first restricted item.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl shadow-sm border p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">
                    {item.name}
                  </h2>

                  <p className="text-slate-500 mt-2">
                    {item.description}
                  </p>

                  <span className="inline-block mt-4 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                    {item.category}
                  </span>
                </div>

                <button
                  onClick={() => deleteItem(item._id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl transition"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

export default RestrictedItems;