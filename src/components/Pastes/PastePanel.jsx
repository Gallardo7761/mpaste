import { useState, useEffect } from "react";
import { Form, Button, Row, Col, FloatingLabel, Alert } from "react-bootstrap";
import '@/css/PastePanel.css';
import PasswordInput from "@/components/Auth/PasswordInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faHeader } from "@fortawesome/free-solid-svg-icons";
import CodeEditor from "./CodeEditor";
import PublicPasteItem from "./PublicPasteItem";
import { useParams, useNavigate } from "react-router-dom";
import { useDataContext } from "@/hooks/useDataContext";
import PasswordModal from "@/components/Auth/PasswordModal.jsx";

const PastePanel = ({ onSubmit, publicPastes }) => {
	const { pasteKey } = useParams();
	const navigate = useNavigate();
	const { getData } = useDataContext();

	const [formData, setFormData] = useState({
		title: "",
		content: "",
		syntax: "",
		burnAfter: false,
		isPrivate: false,
		password: ""
	});

	const [selectedPaste, setSelectedPaste] = useState(null);
	const [editorErrors, setEditorErrors] = useState([]);
	const [fieldErrors, setFieldErrors] = useState({});
	const [showPasswordModal, setShowPasswordModal] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setFieldErrors({});
		setEditorErrors([]);

		try {
			if (onSubmit) await onSubmit(formData);
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

	const handleSelectPaste = async (key) => navigate(`/${key}`);

	const fetchPaste = async (key, pwd = "") => {
		const url = import.meta.env.MODE === 'production'
			? `https://api.miarma.net/v2/mpaste/pastes/${key}`
			: `http://localhost:8081/v2/mpaste/pastes/${key}`;

		const data = await getData(url, { password: pwd }, false);

		if (!data) return;

		setSelectedPaste(data);
		setFormData({
			title: data.title ?? "",
			content: data.content ?? "",
			syntax: data.syntax || "plaintext",
			burnAfter: data.burnAfter || false,
			isPrivate: data.isPrivate || false,
			password: ""
		});
	};

	useEffect(() => { if (pasteKey) fetchPaste(pasteKey); }, [pasteKey]);

	const handleChange = (key, value) => {
		setFormData(prev => ({ ...prev, [key]: value }));
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
							<div className="d-flex flex-column flex-fill gap-3 overflow-auto">
								<FloatingLabel
									controlId="titleInput"
									label={
										<span className={selectedPaste ? "text-white" : ""}>
											<FontAwesomeIcon icon={faHeader} className="me-2" />
											Título
										</span>
									}
								>
									<Form.Control
										disabled={!!selectedPaste}
										type="text"
										value={formData.title}
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

								<Form.Check
									type="switch"
									disabled={!!selectedPaste}
									id="burnAfter"
									label="volátil"
									checked={formData.burnAfter}
									onChange={(e) => handleChange("burnAfter", e.target.checked)}
									className="ms-1 d-flex gap-2 align-items-center"
								/>

								<Form.Check
									type="switch"
									disabled={!!selectedPaste}
									id="isPrivate"
									label="privado"
									checked={formData.isPrivate}
									onChange={(e) => handleChange("isPrivate", e.target.checked)}
									className="ms-1 d-flex gap-2 align-items-center"
								/>

								{formData.isPrivate && (
									<PasswordInput onChange={(e) => handleChange("password", e.target.value)} />
								)}

								<div className="d-flex justify-content-end">
									<Button
										variant="primary"
										type="submit"
										disabled={!!selectedPaste}
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
					fetchPaste(pasteKey, pwd);
				}}
			/>
		</>
	);

};

export default PastePanel;
