import zipfile
import os
import fnmatch
import time

def zipar_projeto(destino_zip='projeto.zip'):
    excluir_padroes = [
        './projeto.zip',
        './node_modules/*',
        './.git/*',
        './dist/*',
        './build/*',
        './.next/*',
        '*.log',
        './__pycache__/*',
        './.venv/*',
        './.env',
        './.DS_Store',
        './.vscode/*'
    ]

    def deve_excluir(caminho):
        for padrao in excluir_padroes:
            if fnmatch.fnmatch(caminho, padrao) or fnmatch.fnmatch('./' + caminho, padrao):
                return True
        return False

    with zipfile.ZipFile(destino_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for raiz, _, arquivos in os.walk('.'):
            for arquivo in arquivos:
                caminho_completo = os.path.join(raiz, arquivo)
                caminho_relativo = os.path.relpath(caminho_completo, '.')

                if deve_excluir(caminho_relativo):
                    continue

                try:
                    # Tenta adicionar normalmente
                    zipf.write(caminho_completo, caminho_relativo)
                except ValueError as e:
                    if 'ZIP does not support timestamps before 1980' in str(e):
                        # Força uma data válida (1980, 1, 1, 0, 0, 0)
                        info = zipfile.ZipInfo(caminho_relativo)
                        info.date_time = (1980, 1, 1, 0, 0, 0)
                        with open(caminho_completo, 'rb') as f:
                            zipf.writestr(info, f.read())
                    else:
                        raise

# Executa
zipar_projeto()
