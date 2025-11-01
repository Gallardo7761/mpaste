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
	const { paste_key } = useParams();
	const navigate = useNavigate();
	const { getData } = useDataContext();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [syntax, setSyntax] = useState("");
	const [burnAfter, setBurnAfter] = useState(false);
	const [isPrivate, setIsPrivate] = useState(false);
	const [password, setPassword] = useState("");
	const [selectedPaste, setSelectedPaste] = useState(null);
	const [error, setError] = useState(null);
	const [showPasswordModal, setShowPasswordModal] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		const paste = {
			title,
			content,
			syntax,
			burn_after: burnAfter,
			is_private: isPrivate,
			password: password || null,
		};
		if (onSubmit) onSubmit(paste);
	};

	const handleSelectPaste = async (key) => {
		navigate(`/${key}`);
	};

	const fetchPaste = async (key, pwd = "") => {
		const url = `https://api.miarma.net/mpaste/v1/pastes/${key}`;
		const { data, error } = await getData(url, {}, {
			'X-Paste-Password': pwd
		});

		if (error) {
			if (error?.status === 401) {
				setShowPasswordModal(true);
				return;
			} else {
				setError(error);
				setSelectedPaste(null);
				return;
			}
		}

		setError(null);
		setSelectedPaste(data);
		setTitle(data.title);
		setContent(data.content);
		setSyntax(data.syntax || "plaintext");
	};

	useEffect(() => {
		if (paste_key) fetchPaste(paste_key);
	}, [paste_key]);

	return (
		<>
			<div className="paste-panel border-0 flex-fill d-flex flex-column min-h-0 p-3">
				{error &&
					<Alert variant="danger" onClose={() => setError(null)} dismissible>
						<strong>
							<span className="text-danger">{
								error.status == 404 ? "404: Paste no encontrada." :
									"Ha ocurrido un error al cargar la paste."
							}</span>
						</strong>
					</Alert>
				}

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
												key={paste.paste_key}
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
								syntax={syntax}
								readOnly={!!selectedPaste}
								onChange={selectedPaste ? undefined : setContent}
								value={content}
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
										placeholder="Título de la paste"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
									/>
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
										value={syntax}
										onChange={(e) => setSyntax(e.target.value)}
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
									checked={burnAfter}
									onChange={(e) => setBurnAfter(e.target.checked)}
									className="ms-1 d-flex gap-2 align-items-center"
								/>

								<Form.Check
									type="switch"
									disabled={!!selectedPaste}
									id="isPrivate"
									label="privado"
									checked={isPrivate}
									onChange={(e) => setIsPrivate(e.target.checked)}
									className="ms-1 d-flex gap-2 align-items-center"
								/>

								{isPrivate && (
									<PasswordInput onChange={(e) => setPassword(e.target.value)} />
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
					fetchPaste(paste_key, pwd); // reintentas con la pass
				}}
			/>
		</>
	);

};

export default PastePanel;
