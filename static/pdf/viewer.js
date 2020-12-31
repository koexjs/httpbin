

const PDFJS = pdfjsLib;

PDFJS.GlobalWorkerOptions.workerSrc = '/static/pdf/lib/pdf.worker.js';

function createSeriesCanvas(num, template) {
  var id = '';
  for (var page = 1; page <= num; page++) {
    id = template + page;
    createPDFContainer(page, id, 'pdfClass');
  }
}

async function renderPageContainer(currentPage, totalPage) {
  var id = `page-${currentPage}`;
  var pageContainer = document.getElementById(id);

  if (!pageContainer) {
    var pdfContainer = document.getElementById('viewer');

    pageContainer = document.createElement('div');
    pageContainer.className = `page ${id}`;
    pageContainer.id = id;
    // pageContainer.style.display = 'flex';
    // pageContainer.style.justifyContent = 'center';

    pdfContainer.appendChild(pageContainer);
  } else {
    for (const element of pageContainer.children) {
      pageContainer.removeChild(element);
    }
  }

  return pageContainer;
}

async function renderPageCanvas(pageContainer, pdf, currentPage, totalPage) {
  var id = `page-canvas-${currentPage}`;
  var canvas = document.getElementById(id);

  if (canvas) {
    pageContainer.removeChild(canvas);
  }

  canvas = document.createElement('canvas');
    canvas.className = `canvas`;
    canvas.id = id;
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

async function renderPageTextLayer(pageContainer, pageCanvas, currentPage, totalPage, textContent, viewport) {
  var id = `page-text-${currentPage}`;
  var textLayerDiv = document.getElementById(id);
  

  if (textLayerDiv) {
    pageContainer.removeChild(textLayerDiv);
  }

  textLayerDiv = document.createElement('div');
  textLayerDiv.className = 'textLayer';
  textLayerDiv.id = id;
  pageContainer.appendChild(textLayerDiv);

  textLayerDiv.style.width = `${pageCanvas.width}px`;
  textLayerDiv.style.height = `${pageCanvas.height}px`;

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
  const pageTextLayer = await renderPageTextLayer(pageContainer, pageCanvas, currentPage, totalPage, textContent, viewport);

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

function debounce(fn) {
  var it;

  return () => {
    if (it) {
      clearTimeout(it);
      it = null;
    }

    it = setTimeout(() => {
      fn.call(null);
    }, 250);
  };
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
    
    window.addEventListener('resize', debounce(() => {
      console.log('onResize');
      renderPDF(pdf);
    }));

    return renderPDF(pdf);
  });
