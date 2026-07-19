"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { MAX_PACKET_BYTES } from "../../lib/packet-schema.ts";

type PacketLoaderProps = {
  errors: string[];
  onDemo: () => void;
  onErrors: (errors: string[]) => void;
  onPacketText: (text: string, sourceName: string) => void;
};

export function validatePacketFileMetadata(
  file: Pick<File, "name" | "size" | "type">,
) {
  const looksLikeJson =
    file.name.toLowerCase().endsWith(".json") ||
    file.type === "application/json" ||
    file.type === "";
  if (!looksLikeJson) {
    return "Choose a local .json SOL trace or proof packet.";
  }
  if (file.size > MAX_PACKET_BYTES) {
    return "Packet exceeds the 5 MiB browser prototype limit.";
  }
  return undefined;
}

export async function readPacketFile(
  file: File,
  onErrors: (errors: string[]) => void,
  onPacketText: (text: string, sourceName: string) => void,
) {
  const metadataError = validatePacketFileMetadata(file);
  if (metadataError) {
    onErrors([metadataError]);
    return;
  }
  try {
    onPacketText(await file.text(), file.name);
  } catch {
    onErrors(["The selected packet could not be read."]);
  }
}

export function PacketLoader({
  errors,
  onDemo,
  onErrors,
  onPacketText,
}: PacketLoaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteValue, setPasteValue] = useState("");

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await readPacketFile(file, onErrors, onPacketText);
  };

  return (
    <div className="packet-loader">
      <div className="packet-action-row">
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept=".json,application/json"
          aria-label="Choose a SOL packet JSON file"
          onChange={onFileChange}
          data-testid="packet-file-input"
        />
        <button
          className="secondary-button"
          type="button"
          onClick={() => inputRef.current?.click()}
          data-testid="open-packet"
        >
          Open packet
        </button>
        <button className="secondary-button" type="button" onClick={onDemo}>
          Load demo
        </button>
        <button
          className="quiet-button"
          type="button"
          aria-expanded={pasteOpen}
          aria-controls="packet-paste-drawer"
          onClick={() => setPasteOpen((open) => !open)}
          data-testid="paste-packet-toggle"
        >
          Paste JSON
        </button>
      </div>

      {pasteOpen && (
        <section
          className="packet-paste-drawer"
          id="packet-paste-drawer"
          aria-label="Paste packet JSON"
        >
          <label htmlFor="packet-json">Packet JSON</label>
          <textarea
            id="packet-json"
            value={pasteValue}
            placeholder='{"schema":"techman.sol-lens.proof-packet/v0.2", ...}'
            onChange={(event) => setPasteValue(event.target.value)}
            data-testid="packet-json"
          />
          <div className="packet-drawer-actions">
            <button
              className="primary-button compact"
              type="button"
              disabled={pasteValue.trim() === ""}
              onClick={() => onPacketText(pasteValue, "pasted-packet.json")}
              data-testid="apply-pasted-packet"
            >
              Apply packet
            </button>
            <button
              className="quiet-button"
              type="button"
              onClick={() => {
                setPasteOpen(false);
                setPasteValue("");
              }}
            >
              Close
            </button>
          </div>
        </section>
      )}

      {errors.length > 0 && (
        <section
          className="packet-error"
          role="alert"
          aria-live="assertive"
          data-testid="packet-error"
        >
          <strong>Packet not loaded</strong>
          <p>The current graph is unchanged. Fix the following and try again:</p>
          <ul>
            {errors.slice(0, 4).map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
          {errors.length > 4 && (
            <span>{errors.length - 4} more validation issues were found.</span>
          )}
        </section>
      )}
    </div>
  );
}

export function handleGraphFileDrop(
  event: DragEvent<HTMLElement>,
  onErrors: (errors: string[]) => void,
  onPacketText: (text: string, sourceName: string) => void,
) {
  event.preventDefault();
  const file = event.dataTransfer.files?.[0];
  if (!file) {
    onErrors(["Drop one local .json SOL packet onto the graph panel."]);
    return;
  }
  void readPacketFile(file, onErrors, onPacketText);
}
