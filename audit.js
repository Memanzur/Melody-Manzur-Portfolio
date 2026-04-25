// Digital Marketing Audit Tool v2 - Brand DNA + Competitor Comparison
(function () {
    'use strict';

    var PSI_API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

    // Step navigation
    document.querySelectorAll('.form-next').forEach(function (btn) {
        btn.addEventListener('click', function () { goToStep(parseInt(this.dataset.next)); });
    });
    document.querySelectorAll('.form-back').forEach(function (btn) {
        btn.addEventListener('click', function () { goToStep(parseInt(this.dataset.back)); });
    });

    function goToStep(step) {
        document.querySelectorAll('.form-step').forEach(function (s) { s.classList.remove('active'); });
        var target = document.querySelector('[data-step="' + step + '"]');
        if (target) target.classList.add('active');
        var bar = document.getElementById('progressBar');
        if (bar) bar.style.width = (step * 25) + '%';
    }

    var form = document.getElementById('auditForm');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); runAudit(); });

    var rerun = document.getElementById('rerunAudit');
    if (rerun) rerun.addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('audit-results').style.display = 'none';
        document.querySelector('.audit-form-section').style.display = '';
        document.querySelector('.audit-hero').style.display = '';
        document.querySelector('.how-it-works').style.display = '';
        document.querySelector('.sample-preview').style.display = '';
        goToStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function runAudit() {
        var websiteUrl = document.getElementById('website').value.trim();
        var competitorUrl = document.getElementById('competitor').value.trim();
        var instagram = document.getElementById('instagram').value.trim();
        var facebook = document.getElementById('facebook').value.trim();
        var tiktok = document.getElementById('tiktok').value.trim();
        var googleBiz = document.getElementById('google-business').value;
        var businessType = document.getElementById('business-type').value;
        var challenge = document.getElementById('biggest-challenge').value;
        var currentMarketing = document.getElementById('current-marketing').value;
        var userName = document.getElementById('name').value.trim();

        // Hide form sections, show loading
        document.querySelector('.audit-form-section').style.display = 'none';
        document.querySelector('.audit-hero').style.display = 'none';
        document.querySelector('.how-it-works').style.display = 'none';
        document.querySelector('.sample-preview').style.display = 'none';
        var loadingEl = document.getElementById('audit-loading');
        loadingEl.style.display = '';

        if (websiteUrl && !websiteUrl.match(/^https?:\/\//)) websiteUrl = 'https://' + websiteUrl;
        if (competitorUrl && !competitorUrl.match(/^https?:\/\//)) competitorUrl = 'https://' + competitorUrl;

        var info = {
            websiteUrl: websiteUrl, competitorUrl: competitorUrl,
            instagram: instagram, facebook: facebook, tiktok: tiktok,
            googleBiz: googleBiz, businessType: businessType,
            challenge: challenge, currentMarketing: currentMarketing, userName: userName
        };

        setLoadingStep(1);

        // Fetch main site
        var mainPromise = websiteUrl ? fetchPSI(websiteUrl) : Promise.resolve(null);
        var compPromise = competitorUrl ? fetchPSI(competitorUrl) : Promise.resolve(null);

        mainPromise.then(function (mainData) {
            setLoadingStep(2);
            setTimeout(function () {
                setLoadingStep(3);
                return compPromise.then(function (compData) {
                    if (competitorUrl) setLoadingStep(4);
                    setLoadingStep(5);
                    setTimeout(function () {
                        showResults(mainData, compData, info);
                    }, 600);
                });
            }, 400);
        }).catch(function () {
            setLoadingStep(5);
            setTimeout(function () { showResults(null, null, info); }, 800);
        });
    }

    function fetchPSI(url) {
        var apiUrl = PSI_API + '?url=' + encodeURIComponent(url) +
            '&category=performance&category=seo&category=accessibility&category=best-practices&strategy=mobile';
        return fetch(apiUrl).then(function (r) { return r.json(); }).catch(function () { return null; });
    }

    function setLoadingStep(n) {
        for (var i = 1; i <= 5; i++) {
            var el = document.getElementById('ls' + i);
            if (!el) continue;
            if (i < n) el.className = 'loading-step done';
            else if (i === n) el.className = 'loading-step active';
            else el.className = 'loading-step';
        }
        var status = document.getElementById('loadingStatus');
        var messages = ['', 'Scanning your website...', 'Extracting brand DNA...', 'Checking mobile experience...', 'Analyzing competitor...', 'Building your report...'];
        if (status && messages[n]) status.textContent = messages[n];
    }

    function extractScores(data) {
        if (!data || !data.lighthouseResult || !data.lighthouseResult.categories) return null;
        var cats = data.lighthouseResult.categories;
        return {
            performance: Math.round((cats.performance ? cats.performance.score : 0) * 100),
            seo: Math.round((cats.seo ? cats.seo.score : 0) * 100),
            accessibility: Math.round((cats.accessibility ? cats.accessibility.score : 0) * 100),
            bestPractices: Math.round((cats['best-practices'] ? cats['best-practices'].score : 0) * 100)
        };
    }

    function scoreClass(score) {
        if (score >= 90) return 'good';
        if (score >= 50) return 'ok';
        return 'bad';
    }

    function showResults(mainData, compData, info) {
        document.getElementById('audit-loading').style.display = 'none';
        var resultsEl = document.getElementById('audit-results');
        resultsEl.style.display = '';

        var scores = extractScores(mainData);
        var compScores = extractScores(compData);
        var audits = mainData && mainData.lighthouseResult ? mainData.lighthouseResult.audits : null;

        var hasRealScores = scores !== null;
        var socialScore = calculateSocialScore(info);
        var marketingScore = calculateMarketingScore(info);

        var perf = scores ? scores.performance : 0;
        var seo = scores ? scores.seo : 0;
        var access = scores ? scores.accessibility : 0;
        var bp = scores ? scores.bestPractices : 0;

        var overall = hasRealScores
            ? Math.round((perf + seo + access + bp + socialScore + marketingScore) / 6)
            : Math.round((socialScore + marketingScore) / 2);

        // Overall score
        animateNumber(document.getElementById('overallScore'), overall);
        var circle = document.getElementById('overallScoreCircle');
        circle.style.borderColor = overall >= 80 ? '#4ade80' : overall >= 50 ? '#fbbf24' : '#f472b6';

        var verdictEl = document.getElementById('overallVerdict');
        if (overall >= 80) verdictEl.textContent = 'Your digital presence is strong. There are still opportunities to optimize and grow, but you are ahead of most businesses in your space.';
        else if (overall >= 60) verdictEl.textContent = 'You have a foundation but there are clear gaps holding you back. Fixing these issues could significantly increase your leads and visibility.';
        else if (overall >= 40) verdictEl.textContent = 'Your online presence needs serious work. You are likely losing customers to competitors with a stronger digital game. The good news: these are all fixable.';
        else verdictEl.textContent = 'Your digital presence is critically weak. Potential customers are not finding you, and those who do are not impressed. This is costing you real money every day.';

        // Individual scores
        if (hasRealScores) {
            setScore('perf', perf, getScoreDetail('performance', perf));
            setScore('seo', seo, getScoreDetail('seo', seo));
            setScore('access', access, getScoreDetail('accessibility', access));
            setScore('bp', bp, getScoreDetail('bestPractices', bp));
        } else {
            setScore('perf', 0, 'Could not analyze website. Make sure the URL is correct and publicly accessible.');
            setScore('seo', 0, 'Website analysis unavailable.');
            setScore('access', 0, 'Website analysis unavailable.');
            setScore('bp', 0, 'Website analysis unavailable.');
        }
        setScore('social', socialScore, getSocialDetail(info));
        setScore('marketing', marketingScore, getMarketingDetail(info));

        // Brand DNA
        if (audits) {
            showBrandDna(audits, info);
        }

        // Competitor comparison
        if (compScores && scores) {
            showCompetitor(scores, compScores, info);
        }

        // Detailed findings
        if (audits) {
            showFindings(audits);
        }

        // Issues
        var issues = generateIssues(scores, compScores, info, hasRealScores);
        renderList('issuesList', issues, 'issue');

        // Recommendations
        var recs = generateRecommendations(scores, compScores, info, hasRealScores);
        renderRecs('recsList', recs);

        // Help cards
        var helps = generateHelpCards(scores, info, hasRealScores);
        renderHelp('helpGrid', helps);

        resultsEl.scrollIntoView({ behavior: 'smooth' });
    }

    // Brand DNA
    function showBrandDna(audits, info) {
        var section = document.getElementById('brandDna');
        section.style.display = '';

        // Screenshot
        var screenshot = audits['final-screenshot'];
        var imgEl = document.getElementById('mobileScreenshot');
        if (screenshot && screenshot.details && screenshot.details.data) {
            imgEl.src = screenshot.details.data;
        }

        // Title
        var titleAudit = audits['document-title'];
        document.getElementById('dnaTitle').textContent = titleAudit && titleAudit.title ? titleAudit.title : (info.websiteUrl || '--');

        // Meta description
        var descAudit = audits['meta-description'];
        var descEl = document.getElementById('dnaDesc');
        if (descAudit && descAudit.score === 1) {
            descEl.textContent = descAudit.description || 'Present';
            descEl.className = 'dna-value pass';
        } else {
            descEl.textContent = 'Missing or empty';
            descEl.className = 'dna-value fail';
        }

        // Mobile friendly
        var viewportAudit = audits['viewport'];
        var mobileEl = document.getElementById('dnaMobile');
        if (viewportAudit && viewportAudit.score === 1) {
            mobileEl.textContent = 'Yes';
            mobileEl.className = 'dna-value pass';
        } else {
            mobileEl.textContent = 'No';
            mobileEl.className = 'dna-value fail';
        }

        // HTTPS
        var httpsEl = document.getElementById('dnaHttps');
        if (info.websiteUrl && info.websiteUrl.startsWith('https')) {
            httpsEl.textContent = 'Yes';
            httpsEl.className = 'dna-value pass';
        } else {
            httpsEl.textContent = 'No';
            httpsEl.className = 'dna-value fail';
        }

        // Load time
        var speedIndex = audits['speed-index'];
        var speedEl = document.getElementById('dnaSpeed');
        if (speedIndex && speedIndex.numericValue) {
            var seconds = (speedIndex.numericValue / 1000).toFixed(1);
            speedEl.textContent = seconds + 's';
            speedEl.className = 'dna-value ' + (parseFloat(seconds) <= 3.4 ? 'pass' : 'fail');
        }

        // Extract colors from screenshot
        if (screenshot && screenshot.details && screenshot.details.data) {
            extractColors(screenshot.details.data);
        }
    }

    function extractColors(dataUrl) {
        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var w = Math.min(img.width, 200);
            var h = Math.min(img.height, 400);
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
            var imageData = ctx.getImageData(0, 0, w, h).data;
            var colorCounts = {};
            for (var i = 0; i < imageData.length; i += 16) {
                var r = Math.round(imageData[i] / 32) * 32;
                var g = Math.round(imageData[i + 1] / 32) * 32;
                var b = Math.round(imageData[i + 2] / 32) * 32;
                if (r > 240 && g > 240 && b > 240) continue; // skip white
                if (r < 15 && g < 15 && b < 15) continue; // skip black
                var key = r + ',' + g + ',' + b;
                colorCounts[key] = (colorCounts[key] || 0) + 1;
            }
            var sorted = Object.entries(colorCounts).sort(function (a, b) { return b[1] - a[1]; });
            var palette = document.getElementById('colorPalette');
            palette.innerHTML = '';
            var shown = 0;
            for (var j = 0; j < sorted.length && shown < 6; j++) {
                var parts = sorted[j][0].split(',');
                var hex = '#' + parts.map(function (c) { return parseInt(c).toString(16).padStart(2, '0'); }).join('');
                // skip very similar to previously added
                var swatch = document.createElement('div');
                swatch.className = 'color-swatch';
                swatch.style.backgroundColor = hex;
                swatch.setAttribute('data-color', hex);
                swatch.title = hex;
                palette.appendChild(swatch);
                shown++;
            }
            if (shown === 0) {
                palette.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">Could not extract colors</span>';
            }
        };
        img.src = dataUrl;
    }

    // Competitor comparison
    function showCompetitor(yours, theirs, info) {
        var section = document.getElementById('competitorSection');
        section.style.display = '';

        try {
            var youHost = new URL(info.websiteUrl).hostname.replace('www.', '');
            var themHost = new URL(info.competitorUrl).hostname.replace('www.', '');
            document.getElementById('compareYouLabel').textContent = youHost;
            document.getElementById('compareThemLabel').textContent = themHost;
        } catch (e) { /* keep defaults */ }

        setCompareRow('Perf', yours.performance, theirs.performance);
        setCompareRow('Seo', yours.seo, theirs.seo);
        setCompareRow('Access', yours.accessibility, theirs.accessibility);
        setCompareRow('Bp', yours.bestPractices, theirs.bestPractices);

        var youTotal = Math.round((yours.performance + yours.seo + yours.accessibility + yours.bestPractices) / 4);
        var themTotal = Math.round((theirs.performance + theirs.seo + theirs.accessibility + theirs.bestPractices) / 4);
        setCompareRow('Total', youTotal, themTotal);

        var verdict = document.getElementById('compareVerdict');
        if (youTotal > themTotal + 10) {
            verdict.textContent = 'You are ahead of your competitor. Keep pushing to widen the gap and maintain your advantage.';
        } else if (themTotal > youTotal + 10) {
            verdict.textContent = 'Your competitor is outperforming you. They are likely getting customers that should be yours. The scores above show exactly where to focus.';
        } else {
            verdict.textContent = 'You and your competitor are neck and neck. Small improvements in the areas where you are behind could give you the edge.';
        }
    }

    function setCompareRow(suffix, you, them) {
        var youEl = document.getElementById('compYou' + suffix);
        var themEl = document.getElementById('compThem' + suffix);
        youEl.textContent = you;
        themEl.textContent = them;
        youEl.className = 'compare-score ' + (you > them ? 'winning' : you < them ? 'losing' : 'tied');
        themEl.className = 'compare-score ' + (them > you ? 'winning' : them < you ? 'losing' : 'tied');
    }

    // Detailed findings from PageSpeed audits
    function showFindings(audits) {
        var section = document.getElementById('findingsSection');
        var list = document.getElementById('findingsList');
        var checks = [
            { key: 'document-title', label: 'Page title' },
            { key: 'meta-description', label: 'Meta description' },
            { key: 'viewport', label: 'Mobile viewport' },
            { key: 'image-alt', label: 'Image alt text' },
            { key: 'link-name', label: 'Descriptive link text' },
            { key: 'html-has-lang', label: 'HTML lang attribute' },
            { key: 'is-crawlable', label: 'Crawlable by search engines' },
            { key: 'robots-txt', label: 'robots.txt valid' },
            { key: 'http-status-code', label: 'Valid HTTP status' },
            { key: 'font-size', label: 'Readable font sizes' },
            { key: 'tap-targets', label: 'Tap targets sized correctly' },
            { key: 'hreflang', label: 'hreflang tags' },
            { key: 'canonical', label: 'Canonical URL' },
            { key: 'structured-data', label: 'Structured data' }
        ];

        var items = [];
        checks.forEach(function (check) {
            var audit = audits[check.key];
            if (!audit) return;
            var status = audit.score === 1 ? 'pass' : audit.score === 0 ? 'fail' : 'warn';
            var desc = audit.score === 1 ? 'Passed' : (audit.description || 'Needs attention');
            items.push({ status: status, label: check.label, desc: desc });
        });

        if (items.length === 0) return;
        section.style.display = '';
        list.innerHTML = '';
        items.forEach(function (item) {
            var div = document.createElement('div');
            div.className = 'finding-item';
            div.innerHTML = '<div class="finding-status ' + item.status + '"></div>' +
                '<div class="finding-text">' + item.label + ' <span>- ' + item.desc + '</span></div>';
            list.appendChild(div);
        });
    }

    function setScore(prefix, score, detail) {
        var badge = document.getElementById(prefix + 'Score');
        var bar = document.getElementById(prefix + 'Bar');
        var detailEl = document.getElementById(prefix + 'Detail');
        badge.textContent = score;
        var cls = scoreClass(score);
        badge.className = 'score-badge ' + cls;
        bar.className = 'score-bar ' + cls;
        detailEl.textContent = detail;
        setTimeout(function () { bar.style.width = score + '%'; }, 100);
    }

    function animateNumber(el, target) {
        var current = 0;
        var step = Math.max(1, Math.floor(target / 40));
        var timer = setInterval(function () {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = current;
        }, 30);
    }

    function calculateSocialScore(info) {
        var score = 0, platforms = 0;
        if (info.instagram) { score += 20; platforms++; }
        if (info.facebook) { score += 15; platforms++; }
        if (info.tiktok) { score += 15; platforms++; }
        if (info.googleBiz === 'yes-active') { score += 25; platforms++; }
        else if (info.googleBiz === 'yes-outdated') { score += 10; platforms++; }
        if (platforms >= 3) score += 15;
        else if (platforms >= 2) score += 10;
        return Math.min(100, score);
    }

    function calculateMarketingScore(info) {
        var score = 20;
        if (info.currentMarketing === 'active') score += 30;
        else if (info.currentMarketing === 'some') score += 20;
        else if (info.currentMarketing === 'social-only') score += 10;
        else if (info.currentMarketing === 'agency') score += 35;
        if (info.challenge === 'everything') score -= 10;
        else if (info.challenge === 'leads') score += 5;
        if (info.googleBiz === 'yes-active') score += 15;
        if (info.instagram && info.facebook) score += 10;
        return Math.max(0, Math.min(100, score));
    }

    function getScoreDetail(cat, score) {
        var details = {
            performance: [
                [90, 'Your site loads fast. Great user experience and Google ranking signal.'],
                [50, 'Your site is slow on mobile. Visitors are leaving before they even see your content.'],
                [0, 'Your site is critically slow. Google is penalizing you and mobile visitors are bouncing.']
            ],
            seo: [
                [90, 'Strong SEO fundamentals. Your site is set up well for search engines.'],
                [50, 'Your SEO has gaps. You are missing opportunities to show up in search results.'],
                [0, 'Major SEO problems. People searching for your services are not finding you.']
            ],
            accessibility: [
                [90, 'Your site is accessible to most users. Good for SEO and legal compliance.'],
                [50, 'Accessibility issues found. Some users cannot navigate your site properly.'],
                [0, 'Serious accessibility problems. Your site is difficult to use for many visitors.']
            ],
            bestPractices: [
                [90, 'Your site follows modern web standards. Secure and well-built.'],
                [50, 'Some technical issues found. These can affect security and user trust.'],
                [0, 'Multiple technical problems. Your site may have security issues.']
            ]
        };
        var d = details[cat] || [];
        for (var i = 0; i < d.length; i++) { if (score >= d[i][0]) return d[i][1]; }
        return '';
    }

    function getSocialDetail(info) {
        var p = [info.instagram, info.facebook, info.tiktok].filter(Boolean).length;
        if (info.googleBiz === 'yes-active' || info.googleBiz === 'yes-outdated') p++;
        if (p >= 3) return 'Solid multi-platform presence. Focus on consistency across all of them.';
        if (p >= 2) return 'On a few platforms. Consider expanding to reach more customers.';
        if (p >= 1) return 'Limited social presence. You are missing free exposure to potential customers.';
        return 'No social media detected. Your competitors are reaching your customers on these platforms.';
    }

    function getMarketingDetail(info) {
        var map = {
            'nothing': 'Relying entirely on word of mouth. A digital presence is insurance for growth.',
            'social-only': 'Posting sometimes is a start, but without a strategy you are leaving results on the table.',
            'some': 'You have the pieces but they are not working together. A unified strategy would multiply results.',
            'active': 'Putting in effort but not seeing results. The strategy needs adjusting, not the effort level.',
            'agency': 'Getting a second opinion is smart. A fresh perspective can break through plateaus.'
        };
        return map[info.currentMarketing] || 'Understanding your marketing helps identify gaps.';
    }

    function generateIssues(scores, compScores, info, hasReal) {
        var issues = [];
        if (hasReal) {
            if (scores.performance < 50) issues.push({ severity: 'critical', title: 'Website is too slow', desc: 'Your site scored ' + scores.performance + '/100 on mobile speed. Pages taking over 3 seconds lose 53% of visitors.' });
            else if (scores.performance < 90) issues.push({ severity: 'warning', title: 'Website speed could be better', desc: 'Scored ' + scores.performance + '/100. Optimizing images and code could speed things up.' });
            if (scores.seo < 50) issues.push({ severity: 'critical', title: 'Poor SEO fundamentals', desc: 'Scored ' + scores.seo + '/100 on SEO. Missing meta tags or poor structure is keeping you invisible.' });
            else if (scores.seo < 90) issues.push({ severity: 'warning', title: 'SEO needs improvement', desc: 'Scored ' + scores.seo + '/100. Optimizations would help you rank higher locally.' });
            if (scores.accessibility < 50) issues.push({ severity: 'warning', title: 'Accessibility problems', desc: 'Scored ' + scores.accessibility + '/100. This affects users and hurts your Google ranking.' });
            if (scores.bestPractices < 50) issues.push({ severity: 'warning', title: 'Technical issues detected', desc: 'Scored ' + scores.bestPractices + '/100. Security or compatibility issues found.' });
        } else if (info.websiteUrl) {
            issues.push({ severity: 'warning', title: 'Website could not be analyzed', desc: 'Could not reach your site. It may be down or the URL may be incorrect.' });
        }
        if (!info.websiteUrl) issues.push({ severity: 'critical', title: 'No website', desc: 'Without a website, you are invisible to anyone searching online.' });
        if (compScores && scores) {
            if (compScores.performance > scores.performance + 15) issues.push({ severity: 'critical', title: 'Competitor is faster than you', desc: 'Their site scores ' + compScores.performance + ' vs your ' + scores.performance + ' on speed. They are providing a better mobile experience.' });
            if (compScores.seo > scores.seo + 15) issues.push({ severity: 'critical', title: 'Competitor has better SEO', desc: 'Their SEO score is ' + compScores.seo + ' vs your ' + scores.seo + '. They are more likely to show up above you in search results.' });
        }
        if (!info.instagram && !info.facebook && !info.tiktok) issues.push({ severity: 'critical', title: 'No social media presence', desc: 'Your customers are on these platforms right now looking for businesses like yours.' });
        else {
            if (!info.instagram) issues.push({ severity: 'warning', title: 'Missing Instagram', desc: 'Instagram is essential for visual businesses like yours.' });
            if (!info.facebook) issues.push({ severity: 'info', title: 'No Facebook page', desc: 'Important for local discovery, reviews, and older demographics.' });
        }
        if (info.googleBiz === 'no' || info.googleBiz === 'unsure') issues.push({ severity: 'critical', title: 'No Google Business Profile', desc: 'You are not showing up in map results when people search for your type of business.' });
        else if (info.googleBiz === 'yes-outdated') issues.push({ severity: 'warning', title: 'Google Business Profile is outdated', desc: 'Wrong hours, old photos, or missing info makes your business look abandoned.' });
        if (info.currentMarketing === 'nothing') issues.push({ severity: 'critical', title: 'No marketing strategy', desc: 'Word of mouth caps your growth. A digital strategy opens new customer channels.' });
        if (info.challenge === 'everything') issues.push({ severity: 'warning', title: 'Challenges across the board', desc: 'No unified strategy. The fix is usually simpler than it feels.' });
        return issues;
    }

    function generateRecommendations(scores, compScores, info, hasReal) {
        var recs = [];
        if (!info.websiteUrl) recs.push({ title: 'You need a website', desc: 'Without one, people searching for your services will never find you. I would start here before anything else.' });
        else if (hasReal && scores.performance < 50) recs.push({ title: 'Your website is too slow', desc: 'A ' + scores.performance + '/100 speed score means people are leaving before they even see what you offer. I would compress your images, clean up the code, and look at your hosting.' });
        else if (hasReal && scores.performance < 90) recs.push({ title: 'Speed up your website', desc: 'Your site scored ' + scores.performance + '/100. Not terrible, but faster sites get better Google rankings and more conversions. Image optimization and code cleanup would help.' });
        if (hasReal && scores.seo < 80) recs.push({ title: 'Fix your SEO', desc: 'Your site scored ' + scores.seo + '/100 on SEO. I would add proper meta titles, descriptions, a sitemap, and optimize for local searches in your area. This is how people find you on Google.' });
        if (compScores && scores) {
            var youAvg = (scores.performance + scores.seo + scores.accessibility + scores.bestPractices) / 4;
            var themAvg = (compScores.performance + compScores.seo + compScores.accessibility + compScores.bestPractices) / 4;
            if (themAvg > youAvg) recs.push({ title: 'Your competitor is ahead of you', desc: 'They outscore you overall. I would focus on the categories with the biggest gap first. Small improvements in the right places can flip the rankings.' });
        }
        if (info.googleBiz === 'no' || info.googleBiz === 'unsure') recs.push({ title: 'Set up a Google Business Profile', desc: 'This is free and it takes 15 minutes. Add your hours, photos, and services. This is how you show up on Google Maps when people search near you.' });
        else if (info.googleBiz === 'yes-outdated') recs.push({ title: 'Update your Google Business Profile', desc: 'An outdated profile makes your business look closed or abandoned. I would add current photos, fix the hours, list all your services, and respond to any reviews.' });
        if (!info.instagram) recs.push({ title: 'Get on Instagram', desc: 'Your customers are scrolling Instagram right now. I would set up a profile, post consistently with local hashtags, and share behind-the-scenes content.' });
        if (info.currentMarketing === 'nothing' || info.currentMarketing === 'social-only') recs.push({ title: 'Build an actual content strategy', desc: 'Random posts do not work. I would plan your content monthly, mix educational posts with results and calls to action. Consistency beats going viral.' });
        if (info.challenge === 'leads') recs.push({ title: 'Fix your conversion flow', desc: 'If people are visiting but not booking or buying, the problem is usually friction. I would make your main CTA impossible to miss, add social proof, and reduce the number of steps to take action.' });
        if (info.challenge === 'brand') recs.push({ title: 'Make your brand consistent', desc: 'Same logo, colors, fonts, and tone everywhere. If your website says one thing and your Instagram says another, people do not trust you. I would unify everything.' });
        return recs;
    }

    function generateHelpCards(scores, info, hasReal) {
        var cards = [];
        if (!info.websiteUrl || (hasReal && scores.performance < 70)) cards.push({ title: 'Website Design or Redesign', desc: 'I will build you a fast, clean website that actually converts visitors into customers. Custom code, no templates. This is what I did for Little Red Esthetics.' });
        if (hasReal && scores.seo < 80) cards.push({ title: 'SEO That Gets You Found', desc: 'I will fix your site structure, meta tags, and content so people in your area find you on Google instead of your competitor.' });
        if (!info.instagram || !info.facebook || !info.tiktok) cards.push({ title: 'Social Media Setup and Management', desc: 'I will set up your profiles, build a content calendar, and create a system so your social media actually works for your business.' });
        if (info.challenge === 'brand') cards.push({ title: 'Brand Identity', desc: 'I will create a consistent look across your website, social media, and marketing materials. Colors, fonts, photography style, everything unified.' });
        if (info.googleBiz !== 'yes-active') cards.push({ title: 'Google Business Profile', desc: 'I will set up or fix your Google Business listing so you show up when people search near you. This is free traffic you are missing right now.' });
        cards.push({ title: 'The Full Package', desc: 'Website + SEO + social media + brand, all handled by me. One person, one vision, everything consistent. This is what gets real results.' });
        return cards;
    }

    function renderList(id, items, type) {
        var el = document.getElementById(id);
        el.innerHTML = '';
        items.forEach(function (item) {
            var div = document.createElement('div');
            div.className = 'issue-item';
            div.innerHTML = '<div class="issue-icon ' + item.severity + '">' +
                (item.severity === 'critical' ? '!' : item.severity === 'warning' ? '?' : 'i') +
                '</div><div class="issue-text"><h5>' + item.title + '</h5><p>' + item.desc + '</p></div>';
            el.appendChild(div);
        });
    }

    function renderRecs(id, items) {
        var el = document.getElementById(id);
        el.innerHTML = '';
        items.forEach(function (item, i) {
            var div = document.createElement('div');
            div.className = 'rec-item';
            div.innerHTML = '<div class="rec-number">' + (i + 1) + '</div><div class="rec-text"><h5>' + item.title + '</h5><p>' + item.desc + '</p></div>';
            el.appendChild(div);
        });
    }

    function renderHelp(id, items) {
        var el = document.getElementById(id);
        el.innerHTML = '';
        items.forEach(function (item) {
            var div = document.createElement('div');
            div.className = 'help-card';
            div.innerHTML = '<h5>' + item.title + '</h5><p>' + item.desc + '</p>';
            el.appendChild(div);
        });
    }
})();
