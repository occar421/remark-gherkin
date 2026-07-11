import "./style.css";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGherkin from "remark-gherkin";

const editor = document.querySelector<HTMLTextAreaElement>("#editor")!;
const astOutput = document.querySelector<HTMLElement>("#ast-output")!;

const processor = unified().use(remarkParse).use(remarkGherkin);

async function updateAst() {
  const content = editor.value;
  try {
    const ast = processor.parse(content);
    astOutput.textContent = JSON.stringify(ast, null, 2);
    astOutput.style.color = "var(--text-h)";
  } catch (err) {
    astOutput.textContent = String(err);
    astOutput.style.color = "red";
  }
}

editor.addEventListener("input", updateAst);

// Initial update
void updateAst();
