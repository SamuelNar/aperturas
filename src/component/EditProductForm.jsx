import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { supabase } from "../utils/supabaseClient";


const EditProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState({ title: "", description: "", prices: "", image: "" });
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            const { data, error } = await supabase
            .from("products")
            .select("title, description, prices, image")
            .eq("id", id)
            .single();
            
            if (error) {
                console.error("Error al obtener producto:", error);
            } else {
                setProduct({ 
                    title: data.title, 
                    description: data.description, 
                    prices: data.prices ?? ""
                });
                setImageUrl(data.image); // Guardamos la imagen actual
            }
            setLoading(false);
        };

        fetchProduct();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        setProduct({
            ...product,
            [name]: name === "prices" ? (value === "" ? "" : parseFloat(value)) : value, // Convierte `prices` a número
        });
    };
   
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let finalImageUrl = imageUrl; // Mantiene la imagen original por defecto

        if (imageFile) {
            const fileName = `images/${Date.now()}-${imageFile.name}`;
            const { error } = await supabase.storage
                .from("products")
                .upload(fileName, imageFile, { upsert: true });

            if (error) {
                console.error("Error al subir la imagen:", error);
            } else {
                finalImageUrl = `https://ihbtfjcrkfszkifefwsm.supabase.co/storage/v1/object/public/products/${fileName}`;
            }
        }

        const { error } = await supabase
            .from("products")
            .update({ 
                title: product.title, 
                description: product.description,
                prices: product.prices || null,
                image: finalImageUrl, // Usa la imagen original si no se cambió                
            })
            .eq("id", id);

        setLoading(false);

        if (error) {
            console.error("Error al actualizar producto:", error);
        } else {
            navigate("/");
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Editar Producto</h2>
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <label className="block mb-2 font-semibold">Título:</label>
                    <input
                        type="text"
                        name="title"
                        value={product.title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />

                    <label className="block mt-4 mb-2 font-semibold">Descripción:</label>
                    <textarea
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                        required
                    ></textarea>

                    <label className="block mt-4 mb-2 font-semibold">Imagen Actual:</label>
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt="Imagen actual"
                            className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                    )}

                    <label className="block mt-4 mb-2 font-semibold">Nueva Imagen (Opcional):</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        className="w-full px-3 py-2 border rounded"
                    />

                    <label className="block mt-4 mb-2 font-semibold">Precio (Opcional):</label>
                    <input
                        type="number"
                        name="prices"
                        step="0.01"
                        value={product.prices}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded"
                    />

                    <button
                        type="submit"
                        className="w-full px-4 py-2 mt-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        disabled={loading}
                    >
                        {loading ? "Guardando..." : "Guardar Cambios"}
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="w-full px-4 py-2 mt-4 bg-gray-500 text-white rounded  transition"
                    >
                            Cancelar
                    </button>
                </form>
            )}
        </div>
    );
};

export default EditProductForm;
