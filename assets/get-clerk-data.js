console.log('Initialized Clerk Data Fetch');
const clerk_wrappers = document.querySelectorAll('.clerk-swiper-wrapper');

clerk_wrappers.forEach(clerk_wrapper => {
  const endpoint = clerk_wrapper.dataset.endpoint;
  const category = parseInt(clerk_wrapper.dataset.category);
  const limit = parseInt(clerk_wrapper.dataset.limit);
  const label = clerk_wrapper.dataset.labels;

  const output = clerk_wrapper;
  let product;

  if (window.location.pathname.includes("products")) {
    product = clerk_wrapper.dataset.product;
  } else if (window.location.pathname.includes("cart")) {
    const productsArray = JSON.parse(clerk_wrapper.dataset.products);
    product = parseInt(productsArray.map(Number).join(','));
  }

  const fetchResponse = async () => {
    try {
      const response = await window.Clerk('call', endpoint, {
        attributes: ['id', 'handle'],
        limit: limit,
        products: [product],
        labels: [label],
        category: category
      });
      if (response.status !== 'ok') {
        throw new Error(
          `Could not fetch Clerk by endpoint: "${endpoint}". Server responded with: ${response.status}`,
        );
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  const fetchProduct = async ({ handle, id }) => {
    const result = await fetch(`/products/${handle}?view=view`);
    const html = await result.text();
    const node = document.createElement('div');
    node.innerHTML = html;

    const productHtml = node.firstElementChild;
    const links = productHtml.querySelectorAll('a');

    links.forEach(link => {
      link.setAttribute('data-clerk-product-id', id);
    });

    return productHtml.outerHTML;
  }

  const getProducts = async (products) => {
    const promises = products.map(product => fetchProduct(product));
    return Promise.all(promises);
  }

  const initClerk = async () => {
    if (!window.Clerk) {
      return;
    }

    try {
      const { product_data: products, result } = await fetchResponse();

      if (result.length === 0) {
        console.log('No results');
      }
      const productsHTML = await getProducts(products);
      output.innerHTML = '';

      productsHTML.forEach((product) => {
        output.insertAdjacentHTML(
          'beforeend',
          `${product}`,
        );
      });

      window.Clerk('click', '*[data-clerk-product-id]');
    } catch (error) {
      console.error(error);
    }
  }

  initClerk();
});
