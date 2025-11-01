import PropTypes from 'prop-types';
import { Modal, Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import PasswordInput from '@/components/Auth/PasswordInput';
import { renderErrorAlert } from '@/util/alertHelpers';
import '@/css/PasswordModal.css';

const PasswordModal = ({
  show,
  onClose,
  onSubmit,
  error = null,
  loading = false
}) => {
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (password.trim() === "") return;
    onSubmit(password);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header
        style={{ backgroundColor: "var(--modal-bg)" }}
      >
        <Modal.Title>
          <FontAwesomeIcon icon={faLock} className="me-2" />
          Paste protegida
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ backgroundColor: "var(--modal-body-bg)" }}>
        <p className="mb-3">
          Esta paste está protegida con contraseña. Introduce la clave para continuar.
        </p>

        {renderErrorAlert(error)}

        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} className='dialog-btn'>
          Cancelar
        </Button>
        <Button
          className='dialog-btn'
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || password.trim() === ""}
          style={{
            backgroundColor: "var(--btn-bg)",
            borderColor: "var(--btn-bg)",
            color: "var(--btn-text)"
          }}
        >
          {loading ? "Verificando..." : "Acceder"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

PasswordModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  loading: PropTypes.bool
};

export default PasswordModal;
