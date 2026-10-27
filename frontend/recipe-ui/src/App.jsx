
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BookOpen, Plus, Search, Clock, ChefHat, Pencil, Trash2,
  X, ArrowLeft, Utensils, Bookmark, Leaf, Sparkles
} from "lucide-react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api/recipes";

const categories = ["All", "Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

const emptyRecipe = {
  name: "",
  category: "Breakfast",
  ingredients: "",
  steps: "",
  cookingTime: 15,
};

function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [mode, setMode] = useState("list");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyRecipe);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function loadRecipes() {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(API);
      setRecipes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError("Couldn't load recipes. Check that your backend and MongoDB are running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecipes();
  }, []);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesCategory = category === "All" || recipe.category === category;
      const term = search.toLowerCase();
      const matchesSearch =
        (recipe.name || "").toLowerCase().includes(term) ||
        (recipe.ingredients || "").toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [recipes, category, search]);

  function openAdd() {
    setForm(emptyRecipe);
    setEditingId(null);
    setSelected(null);
    setMode("form");
    setError("");
  }

  function openEdit(recipe) {
    setForm({
      name: recipe.name || "",
      category: recipe.category || "Breakfast",
      ingredients: recipe.ingredients || "",
      steps: recipe.steps || "",
      cookingTime: recipe.cookingTime || 15,
    });
    setEditingId(recipe._id);
    setSelected(null);
    setMode("form");
    setError("");
  }

  function closePanel() {
    setMode("list");
    setSelected(null);
    setEditingId(null);
    setError("");
  }

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.ingredients.trim() || !form.steps.trim()) {
      setError("Please complete all the fields.");
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      ingredients: form.ingredients.trim(),
      steps: form.steps.trim(),
      cookingTime: Number(form.cookingTime),
    };

    if (!Number.isFinite(payload.cookingTime) || payload.cookingTime < 1) {
      setError("Cooking time must be at least 1 minute.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, payload);
        setNotice("Recipe updated successfully!");
      } else {
        await axios.post(API, payload);
        setNotice("Recipe saved to your archive!");
      }

      await loadRecipes();
      closePanel();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save the recipe. Check your backend.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecipe(recipe) {
    if (!window.confirm(`Delete "${recipe.name}" from your archive?`)) return;

    try {
      await axios.delete(`${API}/${recipe._id}`);
      setRecipes((previous) => previous.filter((item) => item._id !== recipe._id));
      if (selected?._id === recipe._id) closePanel();
      setNotice("Recipe deleted.");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't delete the recipe.");
    }
  }

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  const totalTime = (recipe) => `${recipe.cookingTime} min`;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); closePanel(); }}>
          <span className="brand-mark"><BookOpen size={23} /></span>
          <span>
            <strong>Flavourio</strong>
            <small>A collection of things worth cooking</small>
          </span>
        </a>
        <button className="button button-primary top-add" onClick={openAdd}>
          <Plus size={17} /> Add recipe
        </button>
      </header>

      <main className="page">
        {mode === "list" && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow"><Sparkles size={14} /> YOUR PERSONAL COOKBOOK</span>
                <h1>Good food.<br /><em>Good memories.</em></h1>
                <p>A little place for your favourite flavours, family classics, and recipes you'll make again and again.</p>
                <button className="button button-primary" onClick={openAdd}>
                  <Plus size={17} /> Add your first recipe
                </button>
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="art-circle">
                  <span className="art-sun" />
                  <span className="art-leaf leaf-one">✳</span>
                  <span className="art-leaf leaf-two">✿</span>
                  <div className="art-plate">
                    <div className="art-food">❋</div>
                  </div>
                  <span className="art-note">made with love</span>
                </div>
              </div>
              <div className="hero-bottom"><span>EST. IN YOUR KITCHEN</span><span>NO. {String(recipes.length).padStart(2, "0")}</span></div>
            </section>

            <section className="collection">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">THE COLLECTION</span>
                  <h2>Your recipe shelf <span>({recipes.length})</span></h2>
                </div>
                <div className="search-box">
                  <Search size={17} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Find a recipe..."
                    aria-label="Search recipes"
                  />
                  {search && <button className="clear-search" onClick={() => setSearch("")} aria-label="Clear search"><X size={15} /></button>}
                </div>
              </div>

              <div className="category-row">
                {categories.map((item) => (
                  <button
                    key={item}
                    className={`category-chip ${category === item ? "active" : ""}`}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {notice && <div className="notice">{notice}</div>}
              {error && <div className="error-message">{error}</div>}

              {loading ? (
                <div className="empty-state"><span className="loading-dot" /> Gathering your recipes...</div>
              ) : filteredRecipes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Bookmark size={26} /></div>
                  <h3>{recipes.length === 0 ? "Your shelf is waiting." : "No recipes found."}</h3>
                  <p>{recipes.length === 0 ? "Save that first recipe you never want to forget." : "Try another search or category."}</p>
                  {recipes.length === 0 && <button className="button button-primary" onClick={openAdd}><Plus size={16} /> Add a recipe</button>}
                </div>
              ) : (
                <div className="recipe-grid">
                  {filteredRecipes.map((recipe, index) => (
                    <article className="recipe-card" key={recipe._id}>
                      <div className={`card-art art-${index % 4}`}>
                        <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
                        <span className="card-art-icon">{["✳", "❋", "✿", "✦"][index % 4]}</span>
                        <span className="card-category">{recipe.category}</span>
                      </div>
                      <div className="card-content">
                        <h3>{recipe.name}</h3>
                        <p className="card-preview">{(recipe.ingredients || "").split("\n").filter(Boolean).slice(0, 2).join(" · ")}</p>
                        <div className="card-footer">
                          <span className="time-label"><Clock size={14} /> {totalTime(recipe)}</span>
                          <button className="text-button" onClick={() => { setSelected(recipe); setMode("detail"); }}>
                            Read recipe <span>↗</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <footer className="footer">
              <span><Leaf size={15} /> A little archive of lovely things.</span>
              <span>MADE FOR YOUR TABLE</span>
            </footer>
          </>
        )}

        {mode === "form" && (
          <section className="editor-panel">
            <button className="back-button" onClick={closePanel}><ArrowLeft size={16} /> Back to shelf</button>
            <div className="editor-heading">
              <span className="eyebrow">{editingId ? "MAKE IT YOUR OWN" : "ADD TO YOUR COLLECTION"}</span>
              <h1>{editingId ? "Edit your recipe." : "A new favourite."}</h1>
              <p>Every good recipe deserves a place to call home.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form className="recipe-form" onSubmit={handleSubmit}>
              <label>
                Recipe name <span>*</span>
                <input name="name" value={form.name} onChange={updateForm} placeholder="e.g. Grandma's apple cake" maxLength="100" required />
              </label>
              <div className="form-row">
                <label>
                  Category <span>*</span>
                  <select name="category" value={form.category} onChange={updateForm}>
                    {categories.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  Cooking time (minutes) <span>*</span>
                  <input name="cookingTime" type="number" min="1" max="1440" value={form.cookingTime} onChange={updateForm} required />
                </label>
              </div>
              <label>
                Ingredients <span>*</span>
                <textarea name="ingredients" value={form.ingredients} onChange={updateForm} placeholder={"2 cups flour\n1 cup milk\nA pinch of salt"} rows="5" required />
                <small>Put each ingredient on a new line.</small>
              </label>
              <label>
                Method / instructions <span>*</span>
                <textarea name="steps" value={form.steps} onChange={updateForm} placeholder={"1. Preheat the oven...\n2. Mix the ingredients...\n3. Bake until golden..."} rows="7" required />
                <small>Write your method in the order you follow it.</small>
              </label>
              <div className="form-actions">
                <button type="button" className="button button-quiet" onClick={closePanel}>Cancel</button>
                <button type="submit" className="button button-primary" disabled={saving}>
                  <Bookmark size={16} /> {saving ? "Saving..." : editingId ? "Save changes" : "Save recipe"}
                </button>
              </div>
            </form>
          </section>
        )}

        {mode === "detail" && selected && (
          <section className="detail-panel">
            <button className="back-button" onClick={closePanel}><ArrowLeft size={16} /> Back to shelf</button>
            <div className="detail-cover">
              <span className="eyebrow">FROM YOUR COLLECTION</span>
              <div className="detail-flower">✳</div>
              <span className="detail-category">{selected.category}</span>
            </div>
            <div className="detail-body">
              <div className="detail-title-row">
                <div><h1>{selected.name}</h1><p><Clock size={16} /> {totalTime(selected)} <span>·</span> <Utensils size={16} /> {selected.category}</p></div>
                <div className="detail-actions">
                  <button className="icon-button" onClick={() => openEdit(selected)} aria-label="Edit recipe"><Pencil size={17} /></button>
                  <button className="icon-button danger" onClick={() => deleteRecipe(selected)} aria-label="Delete recipe"><Trash2 size={17} /></button>
                </div>
              </div>
              <div className="detail-columns">
                <div><span className="eyebrow">WHAT YOU'LL NEED</span><h2>Ingredients</h2>
                  <ul className="ingredient-list">{selected.ingredients.split("\n").filter(Boolean).map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
                <div><span className="eyebrow">LET'S MAKE IT</span><h2>The method</h2>
                  <div className="method-text">{selected.steps.split("\n").filter(Boolean).map((step, i) => <p key={i}><span>{String(i + 1).padStart(2, "0")}</span>{step}</p>)}</div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
