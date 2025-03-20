import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Info, X, Loader2 } from "lucide-react";

const GITHUB_OWNER = "GreeningSiren";
const GITHUB_REPO = "ceni-u-magazinite";
const GITHUB_BRANCH = "master";
const __COMMIT_HASH__ = import.meta.env.VITE_GIT_COMMIT_SHA?.slice(0, 7) || "DEV";

function UpdateChecker() {
  const [latestCommit, setLatestCommit] = useState(null);
  const [isOutdated, setIsOutdated] = useState(false);
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFailed, setUpdateFailed] = useState(false);

  useEffect(() => {
    async function checkForUpdate() {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits/${GITHUB_BRANCH}`
        );
        const data = await response.json();
        const latestHash = data.sha.slice(0, 7);
        setLatestCommit(latestHash);
      } catch (error) {
        console.error("Failed to fetch latest commit:", error);
      } finally {
        setLoading(false);
      }
    }
    checkForUpdate();
  }, []);

  useEffect(() => {
    if (latestCommit) {
      setIsOutdated(__COMMIT_HASH__ !== latestCommit);
    }
  }, [latestCommit]);

  useEffect(() => {
    const updateStep = localStorage.getItem("updateStep");
    if (updateStep === "1") {
      setIsUpdating(true);
      updateServiceWorker();

      setTimeout(() => {
        if (localStorage.getItem("updateStep") === "1") {
          setUpdateFailed(true);
          setIsUpdating(false);
          localStorage.removeItem("updateStep");
        }
      }, 12000);
    }
  }, [updateServiceWorker]);

  if ((!isOutdated && !needRefresh[0]) || loading || __COMMIT_HASH__ === "DEV") {
    return null;
  }

  const handleUpdate = async () => {
    setIsUpdating(true);
    localStorage.setItem("updateStep", "1");
    console.log("topki")
    console.log(localStorage.getItem("updateStep"))
    await updateServiceWorker();
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg drop-shadow-xl flex items-center gap-3 animate-slide-up">
      {updateFailed ? (
        <span>⚠️ Презаредете страницата или рестартирайте приложението, за да може да се обнови.</span>
      ) : (
        <>
          <span>Нова възможна версия!</span>
          <button
            onClick={handleUpdate}
            className={`bg-white text-green-600 px-3 py-1 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 ${
              isUpdating ? "cursor-not-allowed" : ""
            }`}
            disabled={isUpdating}
          >
            {isUpdating && <Loader2 className="w-5 h-5 animate-spin" />}
            Update
          </button>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="bg-white text-blue-600 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Info className="w-5 h-5" />
          </button>
        </>
      )}

      {showInfo && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-gray-800 text-white p-4 rounded-lg shadow-lg w-72 text-sm flex flex-col">
          <p>
            <strong>Latest Commit:</strong> {latestCommit || "Loading..."}
          </p>
          <p>
            <strong>Current Commit:</strong> {__COMMIT_HASH__}
          </p>
          <button
            onClick={() => setShowInfo(false)}
            className="mt-2 bg-gray-700 text-white p-2 rounded hover:bg-gray-600 flex items-center gap-1"
          >
            <X className="w-4 h-4" /> Close
          </button>
        </div>
      )}
    </div>
  );
}

export default UpdateChecker;
