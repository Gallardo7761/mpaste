import '@/css/Home.css';
import PastePanel from '@/components/Pastes/PastePanel';
import { useConfig } from '@/hooks/useConfig';
import LoadingIcon from '@/components/LoadingIcon';
import { useDataContext } from '@/hooks/useDataContext';
import { useState } from 'react';
import { DataProvider } from '@/context/DataContext';
import NotificationModal from '@/components/NotificationModal';
import { useSearch } from "@/context/SearchContext";

const Home = () => {
  const { config, configLoading } = useConfig();

  if (configLoading) return <p><LoadingIcon /></p>;

  const reqConfig = {
    baseUrl: `${config.apiConfig.baseUrl}${config.apiConfig.endpoints.pastes.all}`,
    params: {
      _sort: 'created_at',
      _order: 'desc',
    },
  };

  return (
    <DataProvider config={reqConfig}>
      <HomeContent reqConfig={reqConfig} />
    </DataProvider>
  );
};

const HomeContent = ({ reqConfig }) => {
  const { data, dataLoading, dataError, postData } = useDataContext();
  const [error, setError] = useState(null);
  const [key, setKey] = useState(null);
  const { searchTerm } = useSearch();

  if (dataLoading) return <p><LoadingIcon /></p>;
  if (dataError) return <p>Error loading data</p>;

  const filtered = data.filter(paste =>
    paste.title.toLowerCase().includes((searchTerm ?? "").toLowerCase()) ||
    paste.content.toLowerCase().includes((searchTerm ?? "").toLowerCase())
  );

  const handleSubmit = async (paste) => {
    try {
      const createdPaste = await postData(reqConfig.baseUrl, paste);
      if (createdPaste && createdPaste.is_private) {
        setKey(createdPaste.paste_key);
      }
    } catch (error) {
      setError(error);
    }
  };

  return (
    <>
      <PastePanel onSubmit={handleSubmit} publicPastes={filtered} />
      <NotificationModal
        show={key !== null}
        onClose={() => setKey(null)}
        title="Link a tu paste privado"
        message={
          <span>
            Tu paste privado ha sido creado. Puedes acceder a él mediante el siguiente enlace:
            <br /><br />
            <a href={`https://paste.miarma.net/${key}`}>https://paste.miarma.net/${key}</a>
            <br /><br />
            Recuerda que este enlace es único y no se puede recuperar si se pierde.
          </span>
        }
        variant=""
        buttons={[
          { label: "Cerrar", variant: "secondary", onClick: () => setKey(null) }
        ]}
      />
    </>
  );
}

export default Home;
