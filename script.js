(() => {
  'use strict';

  const DEFAULT_FOOTER = 'Not operated by Dhaka Central University. Made by students.';

  const headerEl = document.getElementById('site-header');
  const appEl = document.getElementById('app');
  const footerTextEl = document.getElementById('footer-text');

  let siteData = null;
  let renderToken = 0;
  const paperCache = new Map();

  function pluralize(count, singular, plural) {
    return count + ' ' + (count === 1 ? singular : plural);
  }

  function slug(code) {
    return String(code || '')
      .toLowerCase()
      .replace(/[\s\-_./\\]+/g, '');
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [key, val] of Object.entries(attrs)) {
        if (val === null || val === undefined || val === false) continue;
        if (key === 'className') {
          node.className = val;
        } else if (key === 'textContent') {
          node.textContent = val;
        } else if (key === 'dataset') {
          for (const [dk, dv] of Object.entries(val)) {
            node.dataset[dk] = dv;
          }
        } else if (key.startsWith('on') && typeof val === 'function') {
          node.addEventListener(key.slice(2).toLowerCase(), val);
        } else {
          node.setAttribute(key, String(val));
        }
      }
    }
    if (children !== undefined && children !== null) {
      const list = Array.isArray(children) ? children : [children];
      for (const child of list) {
        if (child === null || child === undefined || child === false) continue;
        node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
      }
    }
    return node;
  }

  function clearNode(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function createChevron() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'toc-chevron');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', 'M7.5 4.5L13 10l-5.5 5.5');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.8');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    return svg;
  }

  function createFallbackLogoSvg() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 240 240');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'DCU QB, Unofficial Question Bank Archive');
    svg.setAttribute('class', 'hero-svg-fallback');

    const bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('width', '240');
    bg.setAttribute('height', '240');
    bg.setAttribute('rx', '14');
    bg.setAttribute('fill', '#16191c');
    svg.appendChild(bg);

    const cap = document.createElementNS(svgNS, 'path');
    cap.setAttribute('d', 'M120 34L74 54l46 20 46-20-46-20z');
    cap.setAttribute('fill', 'none');
    cap.setAttribute('stroke', '#f2f2f4');
    cap.setAttribute('stroke-width', '3.5');
    cap.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(cap);

    const band = document.createElementNS(svgNS, 'path');
    band.setAttribute('d', 'M93 62v15c0 6 12 12 27 12s27-6 27-12V62');
    band.setAttribute('fill', 'none');
    band.setAttribute('stroke', '#f2f2f4');
    band.setAttribute('stroke-width', '3.5');
    band.setAttribute('stroke-linecap', 'round');
    svg.appendChild(band);

    const tassel = document.createElementNS(svgNS, 'path');
    tassel.setAttribute('d', 'M120 53l32 13v16');
    tassel.setAttribute('fill', 'none');
    tassel.setAttribute('stroke', '#c9a85f');
    tassel.setAttribute('stroke-width', '3.5');
    tassel.setAttribute('stroke-linecap', 'round');
    tassel.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(tassel);

    const book = document.createElementNS(svgNS, 'path');
    book.setAttribute('d', 'M82 68v52l38 17 38-17V98');
    book.setAttribute('fill', 'none');
    book.setAttribute('stroke', '#f2f2f4');
    book.setAttribute('stroke-width', '3.5');
    book.setAttribute('stroke-linecap', 'round');
    book.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(book);

    const lens = document.createElementNS(svgNS, 'circle');
    lens.setAttribute('cx', '152');
    lens.setAttribute('cy', '104');
    lens.setAttribute('r', '12');
    lens.setAttribute('fill', 'none');
    lens.setAttribute('stroke', '#f2f2f4');
    lens.setAttribute('stroke-width', '3.5');
    svg.appendChild(lens);

    const title = document.createElementNS(svgNS, 'text');
    title.setAttribute('x', '120');
    title.setAttribute('y', '172');
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('fill', '#f2f2f4');
    title.setAttribute('font-size', '26');
    title.setAttribute('font-weight', '700');
    title.setAttribute('letter-spacing', '2');
    title.textContent = 'DCU QB';
    svg.appendChild(title);

    const sub = document.createElementNS(svgNS, 'text');
    sub.setAttribute('x', '120');
    sub.setAttribute('y', '193');
    sub.setAttribute('text-anchor', 'middle');
    sub.setAttribute('fill', '#f2f2f4');
    sub.setAttribute('font-size', '9.5');
    sub.setAttribute('font-weight', '600');
    sub.setAttribute('letter-spacing', '1.4');
    sub.textContent = 'QUESTION BANK ARCHIVE';
    svg.appendChild(sub);

    const unoff = document.createElementNS(svgNS, 'text');
    unoff.setAttribute('x', '120');
    unoff.setAttribute('y', '210');
    unoff.setAttribute('text-anchor', 'middle');
    unoff.setAttribute('fill', '#a7adb5');
    unoff.setAttribute('font-size', '8.5');
    unoff.setAttribute('letter-spacing', '2.5');
    unoff.textContent = 'UNOFFICIAL';
    svg.appendChild(unoff);

    return svg;
  }

  function createFallbackIconSvg() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 32 32');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('class', 'brand-icon');
    const bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('width', '32');
    bg.setAttribute('height', '32');
    bg.setAttribute('rx', '6');
    bg.setAttribute('fill', '#1e2226');
    svg.appendChild(bg);
    const cap = document.createElementNS(svgNS, 'path');
    cap.setAttribute('d', 'M16 6L5 11l11 5 11-5-11-5zm-7 7.5v4.5c0 2 3.1 3.5 7 3.5s7-1.5 7-3.5v-4.5');
    cap.setAttribute('fill', 'none');
    cap.setAttribute('stroke', '#f2f2f4');
    cap.setAttribute('stroke-width', '1.6');
    cap.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(cap);
    const tassel = document.createElementNS(svgNS, 'path');
    tassel.setAttribute('d', 'M24 12v6');
    tassel.setAttribute('stroke', '#c9a85f');
    tassel.setAttribute('stroke-width', '1.6');
    tassel.setAttribute('stroke-linecap', 'round');
    svg.appendChild(tassel);
    return svg;
  }

  // ===== Menu (right side of header) =====
  function setMenu(panel, btn, open) {
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function createMenu() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const icon = document.createElementNS(svgNS, 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('aria-hidden', 'true');
    const lines = document.createElementNS(svgNS, 'path');
    lines.setAttribute('d', 'M4 7h16M4 12h16M4 17h16');
    lines.setAttribute('stroke', 'currentColor');
    lines.setAttribute('stroke-width', '2');
    lines.setAttribute('stroke-linecap', 'round');
    icon.appendChild(lines);

    const btn = el('button', {
      type: 'button',
      className: 'menu-btn',
      'aria-label': 'Menu',
      'aria-expanded': 'false',
      'aria-controls': 'site-menu'
    }, [icon]);

    const list = el('ul', { className: 'menu-list' });
    list.appendChild(el('li', null, [
      el('a', { href: '#/', className: 'menu-link', textContent: 'Home' })
    ]));
    list.appendChild(el('li', { className: 'menu-label', textContent: 'Faculties' }));
    const faculties = (siteData && siteData.faculties) || [];
    for (const faculty of faculties) {
      list.appendChild(el('li', null, [
        el('a', { href: '#/' + faculty.id, className: 'menu-link', textContent: faculty.en })
      ]));
    }

    const panel = el('nav', {
      id: 'site-menu',
      className: 'menu-panel',
      'aria-label': 'Site menu',
      hidden: true
    }, [list]);

    btn.addEventListener('click', () => {
      setMenu(panel, btn, panel.hidden);
    });
    panel.addEventListener('click', (e) => {
      if (e.target.closest('a')) setMenu(panel, btn, false);
    });

    return el('div', { className: 'menu-wrap' }, [btn, panel]);
  }

  document.addEventListener('click', (e) => {
    const panel = document.querySelector('.menu-panel:not([hidden])');
    if (!panel || e.target.closest('.menu-wrap')) return;
    const btn = document.querySelector('.menu-btn');
    if (btn) setMenu(panel, btn, false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const panel = document.querySelector('.menu-panel:not([hidden])');
    const btn = document.querySelector('.menu-btn');
    if (panel && btn) {
      setMenu(panel, btn, false);
      btn.focus();
    }
  });

  function renderHeader(isHome) {
    clearNode(headerEl);
    if (isHome) {
      const site = (siteData && siteData.site) || {};
      const logoImg = el('img', {
        src: 'logo.png',
        alt: 'DCU QB, Unofficial Question Bank Archive',
        className: 'hero-logo',
        width: '230',
        height: '230',
        onError: () => {
          if (logoImg.parentNode) {
            logoImg.parentNode.replaceChild(createFallbackLogoSvg(), logoImg);
          }
        }
      });

      const head = el('div', { className: 'head-home' }, [
        el('div', { className: 'head-row' }, [
          el('div', { className: 'head-brand' }, [
            el('div', { className: 'head-logo-wrap' }, [logoImg]),
            el('div', { className: 'head-text' }, [
              el('h1', { className: 'head-title', textContent: site.heading || 'Past Exam Questions' }),
              el('p', { className: 'head-tagline', textContent: site.tagline || 'Unofficial Question Bank Archive of Dhaka Central University' })
            ])
          ]),
          createMenu()
        ]),
        el('p', { className: 'head-hint', textContent: site.hint || 'Select a faculty, then choose your department, year, and course.' })
      ]);
      headerEl.appendChild(head);
    } else {
      const siteName = (siteData && siteData.site && siteData.site.name) || 'DCU QB';
      const iconImg = el('img', {
        src: 'icon.png',
        alt: '',
        className: 'brand-icon',
        width: '32',
        height: '32',
        onError: () => {
          if (iconImg.parentNode) {
            iconImg.parentNode.replaceChild(createFallbackIconSvg(), iconImg);
          }
        }
      });

      const bar = el('div', { className: 'topbar' }, [
        el('a', { href: '#/', className: 'brand-link', 'aria-label': 'Home — ' + siteName }, [
          iconImg,
          el('span', { textContent: siteName })
        ]),
        createMenu()
      ]);
      headerEl.appendChild(bar);
    }
  }

  function renderBreadcrumb(items) {
    const ol = el('ol', { className: 'breadcrumb-list' });
    items.forEach((item, idx) => {
      const isLast = idx === items.length - 1;
      const li = el('li', { className: 'breadcrumb-item' });
      if (isLast) {
        li.appendChild(el('span', {
          className: 'breadcrumb-current',
          'aria-current': 'page',
          textContent: item.label
        }));
      } else {
        li.appendChild(el('a', {
          href: item.href,
          className: 'breadcrumb-link',
          textContent: item.label
        }));
        li.appendChild(el('span', {
          className: 'breadcrumb-sep',
          'aria-hidden': 'true',
          textContent: '/'
        }));
      }
      ol.appendChild(li);
    });
    return el('nav', { className: 'breadcrumb', 'aria-label': 'Breadcrumb' }, [ol]);
  }

  function getDepartmentCourseCount(dept) {
    if (!dept || !dept.courses) return 0;
    let total = 0;
    for (const year of siteData.years) {
      const list = dept.courses[year.id];
      if (Array.isArray(list)) {
        total += list.length;
      }
    }
    return total;
  }

  // ===== V3: question papers are single-file .html pages in papers/ =====
  // Default path: papers/{departmentId}_{yearId}_{courseSlug}.html
  // Override: add "file": "papers/anything.html" to a course in data.json
  function getPaperUrl(dept, year, course) {
    if (course && typeof course.file === 'string' && course.file.trim() !== '') {
      return course.file.trim();
    }
    return 'papers/' + dept.id + '_' + year.id + '_' + slug(course.code) + '.html';
  }

  function checkPaper(url) {
    if (/^https?:\/\//i.test(url)) {
      return Promise.resolve(true);
    }
    if (paperCache.has(url)) {
      return paperCache.get(url);
    }
    const promise = fetch(url, { method: 'HEAD', cache: 'no-cache' })
      .then((res) => {
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        return res.status === 200 && ct.includes('html');
      })
      .catch(() => false);
    paperCache.set(url, promise);
    return promise;
  }

  function safeDecode(segment) {
    try {
      return decodeURIComponent(segment);
    } catch {
      return null;
    }
  }

  function parseRoute() {
    const rawHash = window.location.hash || '';
    const cleaned = rawHash.replace(/^#\/?/, '').replace(/\/+$/, '');
    if (!cleaned) {
      return { page: 'home' };
    }
    const rawParts = cleaned.split('/');
    if (rawParts.length > 4) {
      return { page: 'not_found' };
    }
    const parts = [];
    for (const part of rawParts) {
      const decoded = safeDecode(part);
      if (decoded === null || decoded === '') {
        return { page: 'not_found' };
      }
      parts.push(decoded);
    }

    const faculty = siteData.faculties.find((f) => f.id === parts[0]);
    if (!faculty) {
      return { page: 'not_found' };
    }
    if (parts.length === 1) {
      return { page: 'faculty', faculty };
    }

    const dept = (faculty.departments || []).find((d) => d.id === parts[1]);
    if (!dept) {
      return { page: 'not_found' };
    }
    if (parts.length === 2) {
      return { page: 'department', faculty, dept };
    }

    const year = siteData.years.find((y) => y.id === parts[2]);
    if (!year) {
      return { page: 'not_found' };
    }
    if (parts.length === 3) {
      return { page: 'year', faculty, dept, year };
    }

    const targetSlug = slug(parts[3]);
    if (!targetSlug) {
      return { page: 'not_found' };
    }
    const courses = (dept.courses && Array.isArray(dept.courses[year.id])) ? dept.courses[year.id] : [];
    const course = courses.find((c) => slug(c.code) === targetSlug);
    if (!course) {
      return { page: 'not_found' };
    }
    return { page: 'course', faculty, dept, year, course };
  }

  function setPageTitle(label) {
    const siteName = (siteData && siteData.site && siteData.site.name) || 'DCU QB';
    if (!label) {
      const heading = (siteData && siteData.site && siteData.site.heading) || 'Past Exam Questions';
      document.title = siteName + ' — ' + heading;
    } else {
      document.title = label + ' | ' + siteName;
    }
  }

  function buildFacultyList() {
    const ul = el('ul', { className: 'toc-list' });
    for (const faculty of siteData.faculties) {
      const deptCount = Array.isArray(faculty.departments) ? faculty.departments.length : 0;
      const mainNodes = [el('span', { className: 'toc-title', textContent: faculty.en })];
      if (faculty.bn) {
        mainNodes.push(el('span', { className: 'toc-sub', textContent: faculty.bn }));
      }
      const link = el('a', { href: '#/' + faculty.id, className: 'toc-link' }, [
        el('span', { className: 'toc-main' }, mainNodes),
        el('span', { className: 'toc-leader', 'aria-hidden': 'true' }),
        el('span', { className: 'toc-right' }, [
          el('span', { className: 'toc-count', textContent: pluralize(deptCount, 'department', 'departments') }),
          createChevron()
        ])
      ]);
      ul.appendChild(el('li', { className: 'toc-item' }, [link]));
    }
    return ul;
  }

  function runSearch(rawQuery) {
    const q = rawQuery.trim();
    const qLower = q.toLowerCase();
    const qSlug = slug(q);

    const matchedDepts = [];
    const matchedCourses = [];

    for (const faculty of siteData.faculties) {
      for (const dept of (faculty.departments || [])) {
        const deptMatch =
          dept.en.toLowerCase().includes(qLower) ||
          (typeof dept.bn === 'string' && dept.bn.toLowerCase().includes(qLower));

        if (deptMatch && matchedDepts.length < 40) {
          matchedDepts.push({ faculty, dept });
        }

        if (dept.status === 'not_started' || !dept.courses) continue;

        for (const year of siteData.years) {
          const list = dept.courses[year.id];
          if (!Array.isArray(list)) continue;
          for (const course of list) {
            if (matchedCourses.length >= 40) break;
            const codeMatch = qSlug.length > 0 && slug(course.code).includes(qSlug);
            const titleMatch = typeof course.title === 'string' && course.title.toLowerCase().includes(qLower);
            if (codeMatch || titleMatch) {
              matchedCourses.push({ faculty, dept, year, course });
            }
          }
        }
      }
    }

    return { matchedDepts, matchedCourses };
  }

  function renderHome() {
    setPageTitle('');

    const facultyContainer = el('div', { id: 'faculty-list-wrap' }, [buildFacultyList()]);
    const searchResultsContainer = el('div', { id: 'search-results-wrap', hidden: true });
    const liveStatus = el('p', { className: 'visually-hidden', 'aria-live': 'polite' });

    const clearBtn = el('button', {
      type: 'button',
      className: 'search-clear',
      'aria-label': 'Clear search',
      hidden: true,
      textContent: '×'
    });

    const input = el('input', {
      id: 'search-input',
      type: 'search',
      className: 'search-input',
      placeholder: 'Search department or course code',
      autocomplete: 'off',
      spellcheck: 'false'
    });

    function handleSearchUpdate() {
      const value = input.value;
      const trimmed = value.trim();
      clearBtn.hidden = value.length === 0;

      if (!trimmed) {
        searchResultsContainer.hidden = true;
        clearNode(searchResultsContainer);
        facultyContainer.hidden = false;
        liveStatus.textContent = '';
        return;
      }

      facultyContainer.hidden = true;
      searchResultsContainer.hidden = false;
      clearNode(searchResultsContainer);

      const { matchedDepts, matchedCourses } = runSearch(trimmed);

      if (matchedDepts.length === 0 && matchedCourses.length === 0) {
        searchResultsContainer.appendChild(
          el('div', { className: 'notice-box' }, [
            el('p', { className: 'notice-title', textContent: 'No results found.' }),
            el('p', { className: 'notice-sub', textContent: 'Try checking your spelling or searching by course code.' })
          ])
        );
        liveStatus.textContent = 'No results found.';
        return;
      }

      if (matchedDepts.length > 0) {
        const deptUl = el('ul', { className: 'toc-list' });
        for (const { faculty, dept } of matchedDepts) {
          const total = getDepartmentCourseCount(dept);
          let rightLabel = 'Coming soon';
          let isFlag = false;
          if (dept.status === 'not_started') {
            rightLabel = 'Not started';
            isFlag = true;
          } else if (total > 0) {
            rightLabel = pluralize(total, 'course', 'courses');
          }

          const link = el('a', {
            href: '#/' + faculty.id + '/' + dept.id,
            className: 'toc-link'
          }, [
            el('span', { className: 'toc-main' }, [
              el('span', { className: 'toc-title', textContent: dept.en }),
              el('span', { className: 'toc-sub', textContent: faculty.en })
            ]),
            el('span', { className: 'toc-leader', 'aria-hidden': 'true' }),
            el('span', { className: 'toc-right' }, [
              el('span', {
                className: 'toc-count' + (isFlag ? ' is-flag' : ''),
                textContent: rightLabel
              }),
              createChevron()
            ])
          ]);
          deptUl.appendChild(el('li', { className: 'toc-item' }, [link]));
        }

        searchResultsContainer.appendChild(
          el('section', { className: 'search-group' }, [
            el('h2', { className: 'search-group-title', textContent: 'Departments' }),
            deptUl
          ])
        );
      }

      if (matchedCourses.length > 0) {
        const courseUl = el('ul', { className: 'toc-list' });
        for (const { faculty, dept, year, course } of matchedCourses) {
          const hasTitle = typeof course.title === 'string' && course.title.trim() !== '';
          const rowNodes = [el('span', { className: 'code-tag', textContent: course.code })];
          if (hasTitle) {
            rowNodes.push(el('span', { className: 'toc-title', textContent: course.title.trim() }));
          }

          const link = el('a', {
            href: '#/' + faculty.id + '/' + dept.id + '/' + year.id + '/' + slug(course.code),
            className: 'toc-link'
          }, [
            el('span', { className: 'toc-main' }, [
              el('span', { className: 'toc-course-row' }, rowNodes),
              el('span', { className: 'toc-sub', textContent: dept.en + ' / ' + year.label })
            ]),
            el('span', { className: 'toc-leader', 'aria-hidden': 'true' }),
            el('span', { className: 'toc-right' }, [createChevron()])
          ]);
          courseUl.appendChild(el('li', { className: 'toc-item' }, [link]));
        }

        searchResultsContainer.appendChild(
          el('section', { className: 'search-group' }, [
            el('h2', { className: 'search-group-title', textContent: 'Courses' }),
            courseUl
          ])
        );
      }

      liveStatus.textContent =
        pluralize(matchedDepts.length, 'department', 'departments') + ' and ' +
        pluralize(matchedCourses.length, 'course', 'courses') + ' found.';
    }

    input.addEventListener('input', handleSearchUpdate);
    clearBtn.addEventListener('click', () => {
      input.value = '';
      handleSearchUpdate();
      input.focus();
    });

    const searchBox = el('div', { className: 'search-box' }, [
      el('label', { htmlFor: 'search-input', className: 'visually-hidden', textContent: 'Search department or course code' }),
      input,
      clearBtn
    ]);

    headerEl.appendChild(searchBox);
    appEl.appendChild(liveStatus);
    appEl.appendChild(searchResultsContainer);
    appEl.appendChild(facultyContainer);
  }

  function renderFaculty(faculty) {
    setPageTitle(faculty.en);

    appEl.appendChild(renderBreadcrumb([
      { label: 'Home', href: '#/' },
      { label: faculty.en }
    ]));

    const headerNodes = [el('h1', { className: 'page-title', textContent: faculty.en })];
    if (faculty.bn) {
      headerNodes.push(el('p', { className: 'page-sub', textContent: faculty.bn }));
    }
    appEl.appendChild(el('div', { className: 'view-header' }, headerNodes));

    const ul = el('ul', { className: 'toc-list' });
    for (const dept of (faculty.departments || [])) {
      const total = getDepartmentCourseCount(dept);
      let statusLabel = 'Coming soon';
      let isFlag = false;

      if (dept.status === 'not_started') {
        statusLabel = 'Not started';
        isFlag = true;
      } else if (total > 0) {
        statusLabel = pluralize(total, 'course', 'courses');
      }

      const mainNodes = [el('span', { className: 'toc-title', textContent: dept.en })];
      if (dept.bn) {
        mainNodes.push(el('span', { className: 'toc-sub', textContent: dept.bn }));
      }

      const link = el('a', {
        href: '#/' + faculty.id + '/' + dept.id,
        className: 'toc-link'
      }, [
        el('span', { className: 'toc-main' }, mainNodes),
        el('span', { className: 'toc-leader', 'aria-hidden': 'true' }),
        el('span', { className: 'toc-right' }, [
          el('span', {
            className: 'toc-count' + (isFlag ? ' is-flag' : ''),
            textContent: statusLabel
          }),
          createChevron()
        ])
      ]);
      ul.appendChild(el('li', { className: 'toc-item' }, [link]));
    }

    appEl.appendChild(ul);
  }

  function renderDepartment(faculty, dept) {
    setPageTitle(dept.en);

    appEl.appendChild(renderBreadcrumb([
      { label: 'Home', href: '#/' },
      { label: faculty.en, href: '#/' + faculty.id },
      { label: dept.en }
    ]));

    const headerNodes = [el('h1', { className: 'page-title', textContent: dept.en })];
    if (dept.bn) {
      headerNodes.push(el('p', { className: 'page-sub', textContent: dept.bn }));
    }
    appEl.appendChild(el('div', { className: 'view-header' }, headerNodes));

    if (dept.status === 'not_started') {
      appEl.appendChild(
        el('div', { className: 'notice-box is-flag' }, [
          el('p', { className: 'notice-title', textContent: 'Academic activities for this department have not started yet.' }),
          el('p', { className: 'notice-sub', textContent: 'Question papers will be added once classes begin.' })
        ])
      );
      return;
    }

    const grid = el('div', { className: 'year-grid' });
    for (const year of siteData.years) {
      const list = (dept.courses && Array.isArray(dept.courses[year.id])) ? dept.courses[year.id] : [];
      const count = list.length;
      const isMasters = year.id === 'masters';

      const cardNodes = [
        el('span', { className: 'year-ord', textContent: year.ord })
      ];
      if (year.unit) {
        cardNodes.push(el('span', { className: 'year-unit', textContent: year.unit }));
      }
      cardNodes.push(el('span', {
        className: 'year-meta' + (count === 0 ? ' is-empty' : ''),
        textContent: count > 0 ? pluralize(count, 'course', 'courses') : 'Coming soon'
      }));

      grid.appendChild(
        el('a', {
          href: '#/' + faculty.id + '/' + dept.id + '/' + year.id,
          className: 'year-card' + (isMasters ? ' is-full' : '')
        }, cardNodes)
      );
    }

    appEl.appendChild(grid);
  }

  function renderYear(faculty, dept, year, token) {
    setPageTitle(dept.en + ' — ' + year.label);

    appEl.appendChild(renderBreadcrumb([
      { label: 'Home', href: '#/' },
      { label: faculty.en, href: '#/' + faculty.id },
      { label: dept.en, href: '#/' + faculty.id + '/' + dept.id },
      { label: year.label }
    ]));

    appEl.appendChild(el('div', { className: 'view-header' }, [
      el('h1', { className: 'page-title', textContent: dept.en }),
      el('p', { className: 'page-sub', textContent: year.label })
    ]));

    if (dept.status === 'not_started') {
      appEl.appendChild(
        el('div', { className: 'notice-box is-flag' }, [
          el('p', { className: 'notice-title', textContent: 'Academic activities for this department have not started yet.' }),
          el('p', { className: 'notice-sub', textContent: 'Question papers will be added once classes begin.' })
        ])
      );
      return;
    }

    const courses = (dept.courses && Array.isArray(dept.courses[year.id])) ? dept.courses[year.id] : [];
    if (courses.length === 0) {
      appEl.appendChild(
        el('div', { className: 'notice-box' }, [
          el('p', { className: 'notice-title', textContent: 'No courses have been added for this year yet.' }),
          el('p', { className: 'notice-sub', textContent: 'Please check back later.' })
        ])
      );
      return;
    }

    const ul = el('ul', { className: 'toc-list' });

    for (const course of courses) {
      const hasTitle = typeof course.title === 'string' && course.title.trim() !== '';
      const rowNodes = [el('span', { className: 'code-tag', textContent: course.code })];
      if (hasTitle) {
        rowNodes.push(el('span', { className: 'toc-title', textContent: course.title.trim() }));
      }

      const badgeSlot = el('span', { className: 'badge-slot' });

      const link = el('a', {
        href: '#/' + faculty.id + '/' + dept.id + '/' + year.id + '/' + slug(course.code),
        className: 'toc-link'
      }, [
        el('span', { className: 'toc-main' }, [
          el('span', { className: 'toc-course-row' }, rowNodes)
        ]),
        el('span', { className: 'toc-leader', 'aria-hidden': 'true' }),
        el('span', { className: 'toc-right' }, [
          badgeSlot,
          createChevron()
        ])
      ]);

      ul.appendChild(el('li', { className: 'toc-item' }, [link]));

      const paperUrl = getPaperUrl(dept, year, course);
      checkPaper(paperUrl).then((exists) => {
        if (token !== renderToken) return;
        clearNode(badgeSlot);
        badgeSlot.appendChild(
          el('span', {
            className: exists ? 'badge badge-paper' : 'badge badge-soon',
            textContent: exists ? 'Paper' : 'Soon'
          })
        );
      });
    }

    appEl.appendChild(ul);
  }

  function renderCourse(faculty, dept, year, course, token) {
    const hasTitle = typeof course.title === 'string' && course.title.trim() !== '';
    const titleText = hasTitle ? course.title.trim() : course.code;

    setPageTitle(hasTitle ? course.code + ' — ' + titleText : course.code);

    appEl.appendChild(renderBreadcrumb([
      { label: 'Home', href: '#/' },
      { label: faculty.en, href: '#/' + faculty.id },
      { label: dept.en, href: '#/' + faculty.id + '/' + dept.id },
      { label: year.label, href: '#/' + faculty.id + '/' + dept.id + '/' + year.id },
      { label: course.code }
    ]));

    const sheetNodes = [];
    if (hasTitle) {
      sheetNodes.push(el('div', { className: 'code-tag', textContent: course.code }));
    }
    sheetNodes.push(el('h1', { className: 'page-title', textContent: titleText }));

    const metaList = el('dl', { className: 'paper-meta' }, [
      el('div', { className: 'paper-meta-row' }, [
        el('dt', { textContent: 'Department' }),
        el('dd', { textContent: dept.en })
      ]),
      el('div', { className: 'paper-meta-row' }, [
        el('dt', { textContent: 'Year' }),
        el('dd', { textContent: year.label })
      ]),
      el('div', { className: 'paper-meta-row' }, [
        el('dt', { textContent: 'Faculty' }),
        el('dd', { textContent: faculty.en })
      ])
    ]);
    sheetNodes.push(metaList);

    const actionsBox = el('div', { className: 'paper-actions' }, [
      el('p', { className: 'status-checking', textContent: 'Checking for questions…' })
    ]);
    sheetNodes.push(actionsBox);

    appEl.appendChild(el('article', { className: 'paper-sheet' }, sheetNodes));

    const paperUrl = getPaperUrl(dept, year, course);

    checkPaper(paperUrl).then((exists) => {
      if (token !== renderToken) return;
      clearNode(actionsBox);

      if (exists) {
        actionsBox.appendChild(
          el('div', { className: 'action-row' }, [
            el('a', {
              href: paperUrl,
              target: '_blank',
              rel: 'noopener',
              className: 'btn btn-primary',
              textContent: 'View Questions'
            })
          ])
        );
        actionsBox.appendChild(el('p', { className: 'action-note', textContent: 'Opens in a new tab.' }));
      } else {
        actionsBox.appendChild(el('div', { className: 'stamp-soon', textContent: 'Coming Soon' }));
        actionsBox.appendChild(el('p', { className: 'action-note', textContent: 'The questions for this course have not been uploaded yet.' }));
      }
    });
  }

  function renderNotFound() {
    setPageTitle('Page Not Found');
    appEl.appendChild(
      el('div', { className: 'notice-box' }, [
        el('h1', { className: 'page-title', textContent: 'Page Not Found' }),
        el('p', { className: 'notice-sub', textContent: 'The link may be incorrect or outdated.' }),
        el('div', { className: 'notice-action' }, [
          el('a', { href: '#/', className: 'btn btn-primary', textContent: 'Go to Home' })
        ])
      ])
    );
  }

  function renderLoadError() {
    renderHeader(false);
    clearNode(appEl);
    setPageTitle('Failed to Load');
    appEl.appendChild(
      el('div', { className: 'notice-box', role: 'alert' }, [
        el('h1', { className: 'page-title', textContent: 'Failed to load archive data.' }),
        el('p', { className: 'notice-sub', textContent: 'Check your internet connection and reload the page.' })
      ])
    );
  }

  function renderRoute(moveFocus) {
    if (!siteData) return;
    renderToken += 1;
    const currentToken = renderToken;

    const route = parseRoute();
    const isHome = route.page === 'home';

    renderHeader(isHome);
    clearNode(appEl);

    if (route.page === 'home') {
      renderHome();
    } else if (route.page === 'faculty') {
      renderFaculty(route.faculty);
    } else if (route.page === 'department') {
      renderDepartment(route.faculty, route.dept);
    } else if (route.page === 'year') {
      renderYear(route.faculty, route.dept, route.year, currentToken);
    } else if (route.page === 'course') {
      renderCourse(route.faculty, route.dept, route.year, route.course, currentToken);
    } else {
      renderNotFound();
    }

    window.scrollTo(0, 0);
    if (moveFocus) {
      appEl.focus({ preventScroll: true });
    }
  }

  function init() {
    fetch('data.json', { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }
        return res.json();
      })
      .then((json) => {
        siteData = json;
        if (footerTextEl && siteData.site && siteData.site.footer) {
          footerTextEl.textContent = siteData.site.footer;
        } else if (footerTextEl) {
          footerTextEl.textContent = DEFAULT_FOOTER;
        }
        window.addEventListener('hashchange', () => renderRoute(true));
        renderRoute(false);
      })
      .catch((err) => {
        console.error('Failed to load data.json:', err);
        renderLoadError();
      });
  }

  init();
})();
