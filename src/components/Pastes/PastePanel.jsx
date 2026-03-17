import { useState, useEffect, useRef } from "react";
import { Form, Button, Row, Col, FloatingLabel } from "react-bootstrap";
import '@/css/PastePanel.css';
import PasswordInput from "@/components/Pastes/PasswordInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faCode, faHeader } from "@fortawesome/free-solid-svg-icons";
import CodeEditor from "./CodeEditor";
import PublicPasteItem from "./PublicPasteItem";
import { useParams, useNavigate } from "react-router-dom";
import { useDataContext } from "@/hooks/useDataContext";
import { useError } from '@/context/ErrorContext';
import PasswordModal from "@/components/Pastes/PasswordModal.jsx";
import { Client } from "@stomp/stompjs";
import SockJS from 'sockjs-client';

const INITIAL_FORM_DATA = {
	title: "",
	content: "",
	syntax: "",
	burnAfter: false,
	isPrivate: false,
	isRt: false,
	password: ""
};

const PastePanel = ({ onSubmit, publicPastes, mode, pasteKey: propKey, onConnectChange }) => {
	const { pasteKey: urlPasteKey, rtKey } = useParams();
	const navigate = useNavigate();
	const { getData } = useDataContext();
	const { showError } = useError();

	const activeKey = propKey || urlPasteKey || rtKey;

	const [selectedPaste, setSelectedPaste] = useState(null);
	const [editorErrors, setEditorErrors] = useState([]);
	const [fieldErrors, setFieldErrors] = useState({});
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [stompClient, setStompClient] = useState(null);
	const [connected, setConnected] = useState(null);
	const [isSaving, setIsSaving] = useState(false);
	const [formData, setFormData] = useState({ ...INITIAL_FORM_DATA });

	const lastSavedContent = useRef(formData.content);

	const isReadOnly = !!selectedPaste || mode === 'rt';
	const isRemoteChange = useRef(false);

	// Sincroniza el panel cuando cambia el modo o la clave activa:
	// - modo static: intenta cargar la paste seleccionada
	// - modo create: reinicia todo el formulario y errores
	useEffect(() => {
		if (mode === 'static' && activeKey) {
			fetchPaste(activeKey);
		} else if (mode === 'create') {
			setSelectedPaste(null);
			setFormData({ ...INITIAL_FORM_DATA });
			setFieldErrors({});
			setEditorErrors([]);
		}
	}, [activeKey, mode]);

	// Gestiona el ciclo de vida del WebSocket en tiempo real:
	// conecta al entrar en modo rt y limpia la conexión al salir.
	// Los cambios remotos marcan `isRemoteChange` para no disparar autosave en bucle.
	useEffect(() => {
		if (mode === 'rt' && activeKey) {
			const socketUrl = import.meta.env.MODE === 'production'
				? `https://api.miarma.net/v2/mpaste/ws`
				: `http://localhost:8081/v2/mpaste/ws`;

			const socket = new SockJS(socketUrl);
			const client = new Client({
				webSocketFactory: () => socket,
				onConnect: () => {
					setConnected(true);
					onConnectChange(true);
					client.subscribe(`/topic/session/${activeKey}`, (message) => {
						try {
							const remoteState = JSON.parse(message.body);

							setFormData(prev => {
								if (prev.content === remoteState.content && prev.syntax === remoteState.syntax) {
									return prev;
								}
								isRemoteChange.current = true;
								return {
									...prev,
									...remoteState
								};
							});
						} catch (e) {
							console.error("Error parseando el mensaje del socket", e);
						}
					});
					client.publish({ destination: `/app/join/${activeKey}` });
				},
				onDisconnect: () => {
					setConnected(false);
					onConnectChange(false);
				}
			});

			client.activate();
			setStompClient(client);
			return () => client.deactivate();
		} else {
			setConnected(false);
		}
	}, [mode, activeKey]);

	// Autosave con debounce en sesiones RT:
	// solo guarda cuando el contenido local cambia y evita guardar cambios que vienen del socket.
	useEffect(() => {
		if (mode === 'rt' && connected && formData.content) {

			if (isRemoteChange.current) {
				lastSavedContent.current = formData.content;
				isRemoteChange.current = false;
				return;
			}

			if (formData.content !== lastSavedContent.current) {
				const timer = setTimeout(async () => {
					setIsSaving(true);
					try {
						const dataToSave = {
							...formData,
							pasteKey: activeKey,
							isRt: true,
							title: mode === 'rt' ? `Sesión: ${activeKey}` : formData.title
						};
						await onSubmit(dataToSave, true);
						lastSavedContent.current = formData.content;
						console.log("Autosave");
					} catch (err) {
						console.error("Error autosaving:", err);
					} finally {
						setIsSaving(false);
					}
				}, 5000);

				return () => clearTimeout(timer);
			}
		}
	}, [formData.content, mode, connected, activeKey]);

	// Actualiza estado local y, si hay sesión RT activa, propaga el cambio al resto de clientes.
	const handleChange = (key, value) => {
		const updatedData = { ...formData, [key]: value, isRt: mode === 'rt' };

		setFormData(updatedData);

		if (connected && stompClient && activeKey) {
			stompClient.publish({
				destination: `/app/edit/${activeKey}`,
				body: JSON.stringify(updatedData)
			});
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setFieldErrors({});
		setEditorErrors([]);

		const normalizedTitle = (formData.title ?? "").trim();
		const payload = {
			...formData,
			title: formData.isPrivate
				? (normalizedTitle || "Sin título")
				: formData.title
		};

		try {
			if (onSubmit) await onSubmit(payload);
		} catch (error) {
			if (error.status === 422 && error.errors) {
				const newFieldErrors = {};
				Object.entries(error.errors).forEach(([field, msg]) => {
					if (field === "content") {
						setEditorErrors([{ lineNumber: 1, message: msg }]);
					} else {
						newFieldErrors[field] = msg;
					}
				});
				setFieldErrors(newFieldErrors);
			} else {
				showError(error);
			}
		}
	};

	const handleSelectPaste = (key) => navigate(`/s/${key}`);

	// Lookup de paste estática:
	// - 403: pide contraseña
	// - 404: redirige al inicio
	// Se hace en modo silencioso para que no abra el modal global en errores esperados.
	const fetchPaste = async (key, pwd = "") => {
		const url = import.meta.env.MODE === 'production'
			? `https://api.miarma.net/v2/mpaste/pastes/s/${key}`
			: `http://localhost:8081/v2/mpaste/pastes/s/${key}`;

		const headers = pwd ? { "X-Paste-Password": pwd } : {};

		try {
			const response = await getData(url, {
				params: null,
				refresh: false,
				headers,
				silent: true,
			});

			if (response) {
				setSelectedPaste(response);
				setShowPasswordModal(false);
				setFormData({
					...INITIAL_FORM_DATA,
					title: (response.title ?? "").trim() || "Sin título",
					content: response.content ?? "",
					syntax: response.syntax || "plaintext",
					burnAfter: response.burnAfter || false,
					isPrivate: response.isPrivate || false
				});
			}
		} catch (error) {
			const status = error?.status ?? error?.response?.status;
			if (status === 403) {
				setShowPasswordModal(true);
				return;
			}

			if (status === 404) {
				setShowPasswordModal(false);
				navigate("/", { replace: true });
			}
		}
	};

	return (
		<>
			<div className="paste-panel border-0 flex-fill d-flex flex-column min-h-0 p-3">
				<Form onSubmit={handleSubmit} className="flex-fill d-flex flex-column min-h-0">
					<Row className="g-3 flex-fill min-h-0">
						<Col xs={12} lg={2} className="order-last order-lg-first d-flex flex-column flex-fill min-h-0 overflow-hidden">
							<div className="public-pastes d-flex flex-column flex-fill overflow-hidden">
								<h4>pastes públicas</h4>
								<hr />
								<div className="overflow-auto flex-fill" style={{ scrollbarWidth: 'none' }}>
									{publicPastes && publicPastes.length > 0 ? (
										publicPastes.map((paste) => (
											<PublicPasteItem
												key={paste.pasteKey}
												paste={paste}
												onSelect={handleSelectPaste}
											/>
										))
									) : (
										<p>No hay pastes públicas disponibles.</p>
									)}
								</div>
							</div>
						</Col>

						<Col xs={12} lg={7} className="d-flex flex-column flex-fill min-h-0 overflow-hidden">
							<CodeEditor
								className="flex-fill custom-border rounded-4 overflow-hidden pt-4 pe-4"
								syntax={formData.syntax}
								readOnly={!!selectedPaste}
								onChange={(val) => handleChange("content", val)}
								value={formData.content ?? ""}
								editorErrors={editorErrors}
							/>
						</Col>

						<Col xs={12} lg={3} className="d-flex flex-column flex-fill min-h-0 overflow-hidden">
							<div className="d-flex flex-column flex-fill gap-3 overflow-auto p-1">
								<FloatingLabel
									controlId="titleInput"
									label={
										<span className={isReadOnly ? "text-white" : ""}>
											<FontAwesomeIcon icon={faHeader} className="me-2" />
											Título
										</span>
									}
								>
									<Form.Control
										disabled={isReadOnly}
										type="text"
										value={mode === 'rt' ? `Sesión: ${activeKey}` : formData.title}
										onChange={(e) => handleChange("title", e.target.value)}
										isInvalid={!!fieldErrors.title}
									/>
									<Form.Control.Feedback type="invalid">{fieldErrors.title}</Form.Control.Feedback>
								</FloatingLabel>

								<FloatingLabel
									controlId="syntaxSelect"
									label={
										<>
											<FontAwesomeIcon icon={faCode} className="me-2" />
											Sintaxis
										</>
									}
								>
									<Form.Select
										disabled={!!selectedPaste}
										value={formData.syntax}
										onChange={(e) => handleChange("syntax", e.target.value)}
									>
										<option value="">Sin resaltado</option>
										<option value="javascript">JavaScript</option>
										<option value="python">Python</option>
										<option value="java">Java</option>
										<option value="c">C</option>
										<option value="cpp">C++</option>
										<option value="bash">Bash</option>
										<option value="html">HTML</option>
										<option value="css">CSS</option>
										<option value="sql">SQL</option>
										<option value="julia">Julia</option>
										<option value="json">JSON</option>
										<option value="xml">XML</option>
										<option value="yaml">YAML</option>
										<option value="php">PHP</option>
										<option value="ruby">Ruby</option>
										<option value="go">Go</option>
										<option value="rust">Rust</option>
										<option value="typescript">TypeScript</option>
										<option value="kotlin">Kotlin</option>
										<option value="swift">Swift</option>
										<option value="csharp">C#</option>
										<option value="perl">Perl</option>
										<option value="r">R</option>
										<option value="dart">Dart</option>
										<option value="lua">Lua</option>
										<option value="haskell">Haskell</option>
										<option value="scala">Scala</option>
										<option value="objectivec">Objective-C</option>
									</Form.Select>
								</FloatingLabel>

								<div className="d-flex align-items-center ms-1">
									{connected && (isSaving ? (
										<span className="text-muted" style={{ fontSize: '0.8rem' }}>
											<FontAwesomeIcon icon={faCircle} className="pulse-animation me-2" style={{ color: '#ffc107', fontSize: '8px' }} />
											Guardando cambios...
										</span>
									) : (
										<span className="text-success" style={{ fontSize: '0.8rem' }}>
											Cambios guardados
										</span>
									))}
								</div>

								<Form.Check
									type="switch"
									disabled={isReadOnly}
									id="burnAfter"
									label="volátil"
									checked={formData.burnAfter}
									onChange={(e) => handleChange("burnAfter", e.target.checked)}
									className="ms-1 d-flex gap-2 align-items-center"
								/>

								<Form.Check
									type="switch"
									disabled={isReadOnly}
									id="isPrivate"
									label="privado"
									checked={formData.isPrivate}
									onChange={(e) => handleChange("isPrivate", e.target.checked)}
									className="ms-1 d-flex gap-2 align-items-center"
								/>

								{formData.isPrivate && (
									<PasswordInput disabled={isReadOnly} onChange={(e) => handleChange("password", e.target.value)} />
								)}

								<div className="d-flex justify-content-end">
									<Button
										variant="primary"
										type="submit"
										disabled={isReadOnly}
									>
										Crear paste
									</Button>
								</div>
							</div>
						</Col>
					</Row>
				</Form>
			</div>
			<PasswordModal
				show={showPasswordModal}
				onClose={() => setShowPasswordModal(false)}
				onSubmit={(pwd) => {
					setShowPasswordModal(false);
					fetchPaste(activeKey, pwd);
				}}
			/>
		</>
	);

};

export default PastePanel;
