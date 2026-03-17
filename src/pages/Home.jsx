import '@/css/Home.css';
import PastePanel from '@/components/Pastes/PastePanel';
import { useConfig } from '@/hooks/useConfig';
import LoadingIcon from '@/components/LoadingIcon';
import { useDataContext } from '@/hooks/useDataContext';
import { useState, useMemo } from 'react';
import { DataProvider } from '@/context/DataContext';
import NotificationModal from '@/components/NotificationModal';
import { useSearch } from "@/context/SearchContext";
import { useError } from '@/context/ErrorContext';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Home = ({ mode, onConnectChange }) => {
  const { pasteKey, rtKey } = useParams();
  const { config, configLoading } = useConfig();
  const { showError } = useError();
  const location = useLocation();

  const currentKey = mode === 'static' ? pasteKey : rtKey;

  const reqConfig = useMemo(() => {
    if (!config?.apiConfig?.baseUrl) return null;

    const baseApi = `${config.apiConfig.baseUrl}${config.apiConfig.endpoints.pastes.all}`;

    if (mode === 'static' && currentKey) {
      return {
        baseUrl: `${baseApi}/s/${currentKey}`,
        params: {}
      };
    }

    return {
      baseUrl: baseApi,
      params: {}
    };
  }, [config, mode, currentKey]);

  if (configLoading) return <p className="text-center mt-5"><LoadingIcon /></p>;

  if (mode === 'static' && !reqConfig?.baseUrl?.includes('/s/')) {
    return <div className="text-center mt-5"><LoadingIcon /></div>;
  }

  return (
    <DataProvider key={location.key} config={reqConfig} onError={showError}>
      <HomeContent reqConfig={reqConfig} mode={mode} pasteKey={currentKey} onConnectChange={onConnectChange} />
    </DataProvider>
  );
};

const HomeContent = ({ reqConfig, mode, pasteKey, onConnectChange }) => {
  const { data, dataLoading, postData } = useDataContext();
  const [createdKey, setCreatedKey] = useState(null);
  const { searchTerm } = useSearch();

  if (mode === 'static' && dataLoading) return <p className="text-center mt-5"><LoadingIcon /></p>;

  const filtered = (data && Array.isArray(data)) ? data.filter(paste =>
    paste.title.toLowerCase().includes((searchTerm ?? "").toLowerCase())
  ) : [];

  const handleSubmit = async (paste, isAutosave = false) => {
    try {
      const createdPaste = await postData(reqConfig.baseUrl, paste);
      if (!isAutosave && createdPaste && !paste.pasteKey) {
        setCreatedKey(createdPaste.pasteKey);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      <PastePanel
        onSubmit={handleSubmit}
        publicPastes={filtered}
        mode={mode}
        pasteKey={pasteKey}
        onConnectChange={onConnectChange}
      />

      <NotificationModal
        show={createdKey !== null}
        onClose={() => setCreatedKey(null)}
        title="¡Bomba! Paste creado"
        message={
          <span>
            Tu paste se ha guardado correctamente. Puedes compartirlo con este enlace:
            <br /><br />
            <a
              href={`https://paste.miarma.net/s/${createdKey}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary font-weight-bold"
            >
              https://paste.miarma.net/s/{createdKey}
            </a>
            <br /><br />
            {mode === 'rt' && "Nota: Al guardarlo, se ha creado una copia estática permanente."}
          </span>
        }
        variant="success"
        buttons={[
          { label: "Cerrar", variant: "secondary", onClick: () => setCreatedKey(null) }
        ]}
      />
    </>
  );
}

export default Home;
