import { Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { ERROR, PLAYLIST, SEGMENT } from "../constant";
import parseHls from "../lib/parseHls";
import RenderCustomHeaders from "./customHeader";
import Layout from "./layout";

export default function HomePage({ setUrl, setHeaders }) {
  const [text, setText] = useState("");
  const [playlist, setPlaylist] = useState();
  const [limitationModalOpen, setLimitationModalOpen] = useState(false);
  const [customHeadersModalOpen, setCustomHeadersModalOpen] = useState(false);
  const [customHeaders, setCustomHeaders] = useState({});

  function toggleLimitation() {
    setLimitationModalOpen(!limitationModalOpen);
  }

  function toggleCustomHeaders() {
    setCustomHeadersModalOpen(!customHeadersModalOpen);
  }

  function closeQualityDialog() {
    setPlaylist();
  }

  async function validateAndSetUrl(url) {
    toast.loading(`Validating...`, { duration: 800 });
    let data = await parseHls({ hlsUrl: url, headers: customHeaders });
    if (!data) {
      // I am sure the parser lib returning, instead of throwing error
      toast.error(`Invalid url, Content possibly not parsed!`);
      return;
    }

    if (data.type === ERROR) {
      toast.error(data.data);
    } else if (data.type === PLAYLIST) {
      if (!data.data.length) {
        toast.error(`No playlist found in the url`);
      } else {
        setPlaylist(data.data);
      }
    } else if (data.type === SEGMENT) {
      setUrl(url);
      setHeaders(customHeaders);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    try {
      if (params.has("url")) {
        const url = new URL(params.get("url"));
        if (url) {
          setText(url);
          validateAndSetUrl(url);
        }
      }
    } catch (error) {}
  }, []);

  return (
    <>
      <Layout>
        <a
          className="text-sm bg-gradient-to-tr from-orange-500 to-indigo-500 text-white px-4 py-2 rounded-full mb-4"
          href="https://github.com/tuhinpal/hls-downloader/wiki/What's-new-on-0.1.0"
          target="_blank"
          rel="noopener noreferrer"
        >
          What's new
        </a>

        <h1 className="text-3xl lg:text-4xl font-bold">HLS Downloader</h1>
        <h2 className="mt-2 max-w-xl text-center md:text-base text-sm">
          Download hls videos in your browser. Enter your{" "}
          <code className="border boder-gray-200 bg-gray-100 px-1 rounded-sm">
            .m3u8
          </code>{" "}
          uri to continue.
          <br />
          <span className="cursor-pointer underline" onClick={toggleLimitation}>
            See limitations
          </span>
          {" - "}
          <span
            className="cursor-pointer underline"
            onClick={() => {
              setText("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8");
            }}
          >
            Try example
          </span>
        </h2>

        <div className="w-full max-w-3xl mt-5 mb-4">
          <TextField
            label="Paste hls url"
            fullWidth
            size="small"
            placeholder="Please note it should be a .m3u8 url"
            value={text}
            onChange={(e) => setText(e.target.value)}
            // add a button
            InputProps={{
              endAdornment: (
                <button
                  className="text-gray-900 hover:text-gray-700 w-max outline-none pl-4"
                  onClick={toggleCustomHeaders}
                >
                  Headers
                </button>
              ),
            }}
          />
        </div>

        <button
          className="px-4 py-1.5 bg-gray-900 hover:bg-gray-700 text-white rounded-md disabled:opacity-50"
          onClick={() => {
            try {
              const url = new URL(text);
              validateAndSetUrl(url.href);
            } catch (error) {
              toast.error(error.message);
            }
          }}
          disabled={typeof SharedArrayBuffer === "undefined"}
        >
          {typeof SharedArrayBuffer === "undefined"
            ? "Browser doesn't support"
            : "Download"}
        </button>

        <i className="max-w-sm text-xs text-gray-500 text-center mt-2.5">
          * by clicking the above <b>Download</b> button you are agreed that you
          won't use this service for piracy.
        </i>
      </Layout>

      <Dialog
        open={playlist !== undefined}
        fullWidth
        maxWidth="sm"
        onClose={closeQualityDialog}
      >
        <DialogTitle className="flex justify-between">
          <span className="text-xl font-bold">Select quality</span>
          <button className="text-sm" onClick={closeQualityDialog}>
            close
          </button>
        </DialogTitle>
        <DialogContent>
          <div className="flex flex-wrap justify-center items-center">
            {(playlist || []).map((item) => {
              return (
                <div
                  className="flex justify-between items-center mt-2"
                  key={item.bandwidth}
                >
                  <button
                    className="mr-2 px-2 py-1 rounded-md bg-black text-white"
                    onClick={() => {
                      setUrl(item.uri);
                      setHeaders(customHeaders);
                    }}
                  >
                    {item.name}
                  </button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={limitationModalOpen}
        onClose={toggleLimitation}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="flex justify-between">
          <span className="text-xl font-bold">Limitations</span>
          <button className="text-sm" onClick={toggleLimitation}>
            close
          </button>
        </DialogTitle>
        <DialogContent>
          <ol className="list-decimal list-inside text-gray-700">
            {limitations.map((limitation) => (
              <li
                key={limitation}
                dangerouslySetInnerHTML={{ __html: limitation }}
              />
            ))}
          </ol>
        </DialogContent>
      </Dialog>

      <Dialog
        open={customHeadersModalOpen}
        onClose={toggleCustomHeaders}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle className="flex justify-between">
          <span className="text-xl font-bold">Custom headers</span>
          <button className="text-sm" onClick={toggleCustomHeaders}>
            close
          </button>
        </DialogTitle>
        <DialogContent>
          <RenderCustomHeaders
            customHeaders={customHeaders}
            setcustomHeader={setCustomHeaders}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

const limitations = [
  "It may not work on some browsers, Especially on mobile browsers. <a href='https://caniuse.com/sharedarraybuffer' class='underline' target='_blank' rel='noopener'>See supported browsers</a>.",
  "This will request video segments from the server for download, but the browser may block the request due to CORS policy. To avoid this, you can try using some extensions.",
  "It cannot download protected content.",
  "It does not currently support custom headers.",
  "Custom cookies will not be possible because the browser will ignore them.",
  "Performance may be limited by the capabilities of the browser, the device it is running on, and the network connection.",
  "It is not possible to download live streams.",
];
