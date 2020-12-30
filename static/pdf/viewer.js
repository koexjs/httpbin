

const PDFJS = pdfjsLib;

function createSeriesCanvas(num, template) {
  var id = '';
  for (var page = 1; page <= num; page++) {
    id = template + page;
    createPDFContainer(page, id, 'pdfClass');
  }
}

async function renderPageContainer(currentPage, totalPage) {
  var pdfContainer = document.getElementById('viewer');

  var pageContainer = document.createElement('div');
  pageContainer.className = `page page-${currentPage}`;
  pageContainer.style.display = 'flex';
  pageContainer.style.justifyContent = 'center';

  pdfContainer.appendChild(pageContainer);

  return pageContainer;
}

async function renderPageCanvas(pageContainer, pdf, currentPage, totalPage) {
  var canvas = document.createElement('canvas');
  canvas.className = `canvas`;
  canvas.setAttribute('page', currentPage);
  pageContainer.appendChild(canvas);

  var pdfPage = await pdf.getPage(currentPage);

  var viewer = document.querySelector('#viewer');
  var containerWidth = viewer.getBoundingClientRect().width;
  var viewport = pdfPage.getViewport({ scale: containerWidth / pdfPage.getViewport({ scale: 1 }).width });

  var context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  pageContainer.style.width = `${viewport.width}px`;
  pageContainer.style.height = `${viewport.height}px`;

  var renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  return pdfPage
    .render(renderContext)
    .promise
    .then(() => {
      return pdfPage.getTextContent();
    })
    .then((textContent) => {
      return {
        viewport,
        textContent,
        pageCanvas: canvas,
      };
    });
}

async function renderPageTextLayer(pageContainer, pageCanvas, textContent, viewport) {
  const textLayerDiv = document.createElement('div');
  textLayerDiv.className = 'textLayer';
  textLayerDiv.style.width = `${pageCanvas.width}px`;
  textLayerDiv.style.height = `${pageCanvas.height}px`;

  pageContainer.appendChild(textLayerDiv);

  return pdfjsLib
    .renderTextLayer({
      container: textLayerDiv,
      textContent,
      viewport,
    });
}

async function renderPage(pdf, currentPage, totalPage) {
  const pageContainer = await renderPageContainer(currentPage, totalPage);
  const { pageCanvas, textContent, viewport } = await renderPageCanvas(pageContainer, pdf, currentPage, totalPage);
  const pageTextLayer = await renderPageTextLayer(pageContainer, pageCanvas, textContent, viewport);

}

async function renderPDF(pdf) {
  const totalPage = pdf.numPages;

  //将pdf渲染到画布上去
  for (var page = 1; page <= totalPage; page++) {
    renderPage(pdf, page, totalPage);
  }
}

function loadPDF(fileURL) {
  return PDFJS
    .getDocument(fileURL)
    .promise;
}

const DEMO_PDF = '/static/pdf/git.pdf';
let pdfUrl = new URLSearchParams(window.location.search)
  .get('url') || DEMO_PDF;

// proxy outer url
if (!pdfUrl.startsWith('/')) {
  pdfUrl = `/proxy?url=${encodeURIComponent(pdfUrl)}`;
}

loadPDF(pdfUrl)
  .then(pdf => {
    return renderPDF(pdf);
  });
