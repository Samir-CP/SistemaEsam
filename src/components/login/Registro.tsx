import { useState } from "react";
import { ImageUpload } from "../upload/Uploadimages";
import { CountriesFormSelect } from "../ui/CountriesFormSelect";
import { ProfesionFormSelect } from "../docentes/ProfesionFormSelect";
import { CountryCodeForm } from "../ui/CountryCodeForm";
import { AreaForm } from "../ui/AreaForm";
import "./login.css";
export const RegistroDocente = () => {
  const [formData, setFormData] = useState({
    usuario: "",
    password: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    correo: "",
    ciudadRadicacion: "",
    idPais: "",
    telefono: "",
    diaNacimiento: "",
    mesNacimiento: "",
    anioNacimiento: "",
    idProfesion: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const togglePasswordVisibility = () => {
    setShowPassword((prevShow) => !prevShow);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setProfileImage(file); // Guardar el archivo en el estado

    // Generar la previsualización de la imagen
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null); // Limpiar la previsualización si no hay archivo
    }

    console.log("Imagen seleccionada:", file);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[0-9])(?=.{8,})/; // Mínimo 8 caracteres, al menos un número
    if (!passwordRegex.test(formData.password)) {
      setMessage(
        "La contraseña debe tener al menos 8 caracteres y contener al menos un número."
      );
      return; // No continuar con el envío del formulario
    }
    const phoneRegex = /^[0-9]+$/; // Solo permite números
    if (!phoneRegex.test(formData.telefono)) {
      setMessage("El número de contacto debe contener solo números.");
      return; // No continuar con el envío del formulario
    }
    // Construir la fecha de nacimiento en formato YYYY-MM-DD
    const fechaNacimiento = `${formData.anioNacimiento}-${formData.mesNacimiento}-${formData.diaNacimiento}`;
    const formDataToSend = new FormData();

    // Añadir datos del formulario
    (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });
    formDataToSend.append("fechaNacimiento", fechaNacimiento);

    // Añadir la imagen al FormData si existe
    if (profileImage) {
      console.log("Imagen a enviar:", profileImage); // Log para verificar antes de añadir al FormData
      formDataToSend.append("fotografia", profileImage);
    } else {
      console.warn("No se seleccionó ninguna imagen");
    }
    // Verificar todo el contenido del FormData
    formDataToSend.forEach((value, key) => {
      console.log(`${key}:`, value);
    });
    try {
      const response = await fetch("/api/insert_postulante", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("token", result.token);

        setFormData({
          usuario: "", // Nuevo campo
          password: "",
          nombres: "",
          apellidoPaterno: "",
          apellidoMaterno: "",
          correo: "",
          ciudadRadicacion: "",
          idPais: "",
          telefono: "",
          diaNacimiento: "",
          mesNacimiento: "",
          anioNacimiento: "",
          idProfesion: "",
        });
        setProfileImage(null);
        // Redirigir al dashboard
        window.location.href = result.redirectTo;
      } else {
        setMessage(result.error || "Error al enviar la postulación.");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setMessage("Error en la conexión al servidor.");
    }
  };
  const handleLogin = () => {
    window.location.href = "/login";
  };
  return (
    <div className="login-container">
      <div className="login-image"></div>
      <div className="register-box">
        <h1 className="login-title">Formulario de Registro</h1>
        <form onSubmit={handleSubmit} className="login-form">
          {/* Campos del formulario */}
          <div
            style={{
              marginTop: "15px",
              textAlign: "center",
              marginBottom: "15px",
            }}
          >
            <img
              src={imagePreview || "/images/perfil-docente-pordefecto.png"}
              alt="Previsualización"
              width="100"
              height="100"
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
          </div>
          <div className="form-row" style={{ marginBottom: "10px" }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect} // Selección de imagen
            />
          </div>
          <input
            type="text"
            name="usuario"
            placeholder="Usuario"
            value={formData.usuario}
            onChange={handleChange}
            className="login-input"
          />

          {/* Campo de Contraseña */}
          <div className="form-group input__group">
            <div className="password-group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                className="login-input"
              />

              <span
                className="toggle-password"
                onClick={togglePasswordVisibility}
                title={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                  >
                    <path d="M12 4.5C7.5 4.5 3.8 7.3 2 12c1.8 4.7 5.5 7.5 10 7.5s8.2-2.8 10-7.5c-1.8-4.7-5.5-7.5-10-7.5zm0 13c-3.1 0-5.6-2.5-5.6-5.5S8.9 6.5 12 6.5s5.6 2.5 5.6 5.5-2.5 5.5-5.6 5.5zm0-2.1c1.8 0 3.3-1.4 3.3-3.4s-1.4-3.4-3.3-3.4-3.3 1.4-3.3 3.4 1.4 3.4 3.3 3.4z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                  >
                    <path d="M2 12c1.8 4.7 5.5 7.5 10 7.5 2.5 0 4.9-.9 6.9-2.5l2.4 2.4 1.4-1.4-19-19-1.4 1.4 2.4 2.4C3.1 7.1 2 9.4 2 12zm10-7.5c-2.5 0-4.9.9-6.9 2.5l9.9 9.9c2-.5 3.9-1.7 5.2-3.4-1.8-4.7-5.5-7.5-10-7.5zm-6 3.6 3.3 3.3C9.1 10.1 10 10 12 10c1.4 0 2.7.1 4 .4l1.7 1.7c-.4-.1-.9-.1-1.7-.1-2.1 0-4 .5-5.7 1.3L4.5 8.1z" />
                  </svg>
                )}
              </span>
            </div>
          </div>

          <input
            type="text"
            name="nombres"
            placeholder="Nombres"
            value={formData.nombres}
            onChange={handleChange}
            className="login-input"
          />
          <input
            type="text"
            name="apellidoPaterno"
            placeholder="Apellido Paterno"
            value={formData.apellidoPaterno}
            onChange={handleChange}
            className="login-input"
          />
          <input
            type="text"
            name="apellidoMaterno"
            placeholder="Apellido Materno"
            value={formData.apellidoMaterno}
            onChange={handleChange}
            className="login-input"
          />
          <input
            type="email"
            name="correo"
            placeholder="Correo"
            value={formData.correo}
            onChange={handleChange}
            className="login-input"
          />
          <input
            type="text"
            name="ciudadRadicacion"
            placeholder="Ciudad de Radicación"
            value={formData.ciudadRadicacion}
            onChange={handleChange}
            className="login-input"
          />
          <div className="form-group input__group">
            <div className="country-select-group">
              <CountriesFormSelect
                valueAndId="idPais"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    idPais: e.target.value,
                  }))
                }
              />
            </div>
          </div>
         

          <div className="form-group input__group">
            <ProfesionFormSelect
              valueAndId="idProfesion"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
            />
          </div>
          <input
            type="text"
            name="telefono"
            placeholder="Numero de contacto"
            className="login-input"
            id="telefono"
            value={formData.telefono}
            onChange={handleChange}
          />
          <label htmlFor="" className="label-text">
            Fecha de nacimiento
          </label>
          <div className="form-date-row">
            <div className="form-date">
              <select
                className="date-select"
                id="diaNacimiento"
                name="diaNacimiento"
                value={formData.diaNacimiento}
                onChange={handleChange}
                required
              >
                <option value="">Día</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <span className="error-text"></span>
              <i className="error-icon"></i>
            </div>
            <div className="form-date">
              <select
                className="date-select"
                id="mesNacimiento"
                name="mesNacimiento"
                value={formData.mesNacimiento}
                onChange={handleChange}
                required
              >
                <option value="">Mes</option>
                {[
                  "Enero",
                  "Febrero",
                  "Marzo",
                  "Abril",
                  "Mayo",
                  "Junio",
                  "Julio",
                  "Agosto",
                  "Septiembre",
                  "Octubre",
                  "Noviembre",
                  "Diciembre",
                ].map((mes, i) => (
                  <option key={i + 1} value={i + 1}>
                    {mes}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-date">
              <select
                className="date-select"
                id="anioNacimiento"
                name="anioNacimiento"
                value={formData.anioNacimiento}
                onChange={handleChange}
                required
              >
                <option value="">Año</option>
                {Array.from({ length: 100 }, (_, i) => (
                  <option key={2023 - i} value={2023 - i}>
                    {2023 - i}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <input
            type="submit"
            className="register-button"
            value="Registrarse"
            name="Registrarse"
            placeholder="Registrarse"
          />
          {message && <p className="register-error">{message}</p>}
          <p className="register-message">
            ¿Ya tienes una cuenta?{" "}
            <span className="register-link" onClick={handleLogin}>
              Iniciar Sesion
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};
