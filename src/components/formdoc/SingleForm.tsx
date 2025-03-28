import { useState } from "react";
import { ImageUpload } from "../upload/Uploadimages";
import { CountriesFormSelect } from "../ui/CountriesFormSelect";
import { CountryCodeForm } from "../ui/CountryCodeForm";
import { AreaForm } from "../ui/AreaForm";

export const SingleForm = () => {
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
        setMessage("Postulación enviada correctamente.");
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
        });
        setProfileImage(null);
      } else {
        setMessage(result.error || "Error al enviar la postulación.");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setMessage("Error en la conexión al servidor.");
    }
  };

  return (
    <div className="page-content ">
      <div className="page-content page-content--index">
        <section className="consultation">
          <div className="container">
            <div className="row">
              <div className="col-md-6 col-sm-12">
                <h1 className="title-homepage title-homepage--lg">
                  Formulario Registro Docentes
                </h1>
              </div>
              <div className="col-md-6 col-sm-12">
                <form encType="multipart/form-data" onSubmit={handleSubmit}>
                  <div
                    style={{
                      marginTop: "15px",
                      textAlign: "center",
                      marginBottom: "15px",
                    }}
                  >
                    <img
                      src={
                        imagePreview || "/images/perfil-docente-pordefecto.png"
                      }
                      alt="Previsualización"
                      width="150"
                      height="150"
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

                  <div className="form-row">
                    <div className="form-group input__group">
                      <input
                        type="text"
                        name="usuario"
                        id="usuario"
                        className="form-control js-control-input"
                        value={formData.usuario}
                        onChange={handleChange}
                      />
                      <label htmlFor="usuario">Usuario</label>
                      <span className="error-text"></span>
                      <i className="error-icon"></i>
                    </div>
                    <div className="form-group input__group">
                      <div className="password-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          id="password"
                          className="form-control js-control-input"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <label htmlFor="password">Contraseña</label>
                        <span className="error-text"></span>
                        <i className="error-icon"></i>
                        <span
                          className="toggle-password"
                          onClick={togglePasswordVisibility}
                          title={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
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

                        <style>{`
        .password-group {
          position: relative;
        }

        .password-group input {
          padding-right: 40px; /* Espacio para el icono */
        }

        .password-group .toggle-password {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          font-size: 18px;
        }
      `}</style>
                      </div>
                    </div>
                    <div className="form-group input__group">
                      <input
                        type="text"
                        name="nombres"
                        id="nombres"
                        className="form-control js-control-input"
                        value={formData.nombres}
                        onChange={handleChange}
                      />
                      <label htmlFor="nombres">Nombres</label>
                      <span className="error-text"></span>
                      <i className="error-icon"></i>
                    </div>
                  </div>
                  <div className="form-row row">
                    <div className="form-group col-md-6 col-sm-12 input__group">
                      <input
                        type="text"
                        name="apellidoPaterno"
                        id="apellidoPaterno"
                        className="form-control js-control-input"
                        value={formData.apellidoPaterno}
                        onChange={handleChange}
                      />
                      <label htmlFor="apellidoPaterno">Apellido paterno</label>
                      <span className="error-text"></span>
                      <i className="error-icon"></i>
                    </div>
                    <div className="form-group col-md-6 col-sm-12 input__group">
                      <input
                        type="text"
                        name="apellidoMaterno"
                        id="apellidoMaterno"
                        className="form-control js-control-input"
                        value={formData.apellidoMaterno}
                        onChange={handleChange}
                      />
                      <label htmlFor="apellidoMaterno">Apellido Materno</label>
                      <span className="error-text"></span>
                      <i className="error-icon"></i>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group input__group">
                      <input
                        type="text"
                        name="correo"
                        id="correo"
                        className="form-control js-control-input"
                        value={formData.correo}
                        onChange={handleChange}
                      />
                      <label htmlFor="correoElectronico">
                        Correo electrónico
                      </label>
                      <span className="error-text"></span>
                      <i className="error-icon"></i>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group input__group">
                      <input
                        type="text"
                        name="ciudadRadicacion"
                        id="ciudadRadicacion"
                        className="form-control js-control-input"
                        value={formData.ciudadRadicacion}
                        onChange={handleChange}
                      />
                      <label htmlFor="ciudadRadicacion">
                        Ciudad de radicación
                      </label>
                      <span className="error-text"></span>
                      <i className="error-icon"></i>
                    </div>
                  </div>
                  <div className="form-row">
                    <div
                      id="country_wrapper"
                      className="form-group form-select"
                    >
                      <CountriesFormSelect
                        valueAndId="idPais"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            idPais: e.target.value,
                          }))
                        }
                      />
                      <span className="error-text"></span>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="pw-ui-control form-group">
                      <div className="pw-ui-phone-input">
                        <div className="pw-ui-control">
                          <div className="pw-ui-control-input__wrapper">
                            <input
                              type="text"
                              name="telefono"
                              className="pw-ui-control-input__field pw-ui-js-control-input no-arrows"
                              id="telefono"
                              value={formData.telefono}
                              onChange={handleChange}
                            />
                            <div className="pw-ui-control-placeholder">
                              Número de contacto
                            </div>
                            <span className="error-text"></span>
                            <i className="error-icon"></i>
                          </div>
                        </div>
                        <div className="pw-ui-phone-input__pseudo-field pw-ui-js-phone-input-toggler">
                          <div className="pw-ui-phone-input__value pw-ui-js-phone-input-show">
                            +
                          </div>
                          <svg
                            width="12"
                            height="5"
                            className="pw-ui-phone-input__arrow"
                          >
                            <use xlinkHref="#pw-ui-ico-chevron"></use>
                          </svg>
                        </div>
                        <CountryCodeForm valueAndId="codigo" />
                      </div>
                    </div>
                  </div>
                  <div className="form-row row">
                    <label htmlFor="" className="datePicker-label">
                      Fecha de nacimiento
                    </label>
                    <div className="form-group form-select-sm col-md-4 col-sm-12">
                      <select
                        className="country-item form-control"
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
                    <div className="form-group form-select-sm col-md-4 col-sm-12">
                      <select
                        className="country-item form-control"
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
                      <span className="error-text"></span>
                      <i className="error-icon"></i>
                    </div>
                    <div className="form-group form-select-sm col-md-4 col-sm-12">
                      <select
                        className="country-item form-control"
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
                      <span className="error-text"></span>
                      <i className="error-icon"></i>
                    </div>
                  </div>
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ display: "none" }}
                  >
                    <symbol id="pw-ui-ico-chevron" viewBox="0 0 10 5">
                      <path
                        fill="none"
                        fillRule="evenodd"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 0L4.999625 4.285714 1 0"
                      ></path>
                    </symbol>
                  </svg>
                  <div className="form-row">
                    <div className="form-group input__group">
                      <input
                        type="submit"
                        className="btn btn-primary"
                        value="Registrarse"
                        name="Registrarse"
                      />
                    </div>
                  </div>
                </form>
                {message && <p>{message}</p>}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
