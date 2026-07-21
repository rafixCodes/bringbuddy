import { useEffect, useState } from "react";
import api from "../services/api";

function RestrictedItems() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Prohibited");

  const fetchItems = async () => {
    try {
      const res = await api.get("/restricted-items");
      setItems(res.data.items);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
      setCategory("Prohibited");

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
    <div style={{ padding: "20px" }}>
      <h2>Restricted Items</h2>

      <form onSubmit={addItem}>
        <input
          placeholder="Item Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <br /><br />

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <br /><br />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Prohibited</option>
          <option>Restricted</option>
          <option>Fragile</option>
          <option>Dangerous</option>
        </select>

        <br /><br />

        <button type="submit">Add Item</button>
      </form>

      <hr />

      {items.map((item) => (
        <div
          key={item._id}
          style={{
            border: "1px solid #ccc",
            marginBottom: "10px",
            padding: "10px",
          }}
        >
          <h4>{item.name}</h4>

          <p>{item.description}</p>

          <p>
            <strong>{item.category}</strong>
          </p>

          <button onClick={() => deleteItem(item._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default RestrictedItems;
