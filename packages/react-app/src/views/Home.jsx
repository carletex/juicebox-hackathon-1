import { useContractReader } from "eth-hooks";
import React, { useEffect, useState } from "react";
import { Button, List, Card, message } from "antd";
import { ipfs } from "../helpers";
import { useJuiceBoxBalance } from "../hooks";

const { ethers } = require("ethers");

function Home({ DEBUG, readContracts, writeContracts, tx, mainnetProvider, targetNetwork, config }) {
  const totalSupply = useContractReader(readContracts, "JBNFT", "totalSupply");
  if (DEBUG) console.log("🤗 totalSupply:", totalSupply);

  const { data: balance } = useJuiceBoxBalance({ provider: mainnetProvider, projectId: config.juiceBoxProjectId });
  const balanceETH = balance ? parseFloat(ethers.utils.formatEther(balance)).toFixed(4) : "...";

  const [levels, setLevels] = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(true);

  useEffect(() => {
    const updateLevels = async () => {
      if (readContracts.JBNFT) {
        setLoadingLevels(true);
        const levelIdCounter = await readContracts.JBNFT.levelIdCounter();
        if (DEBUG) console.log("levelIdCounter:", levelIdCounter);

        if (levelIdCounter > 0) {
          const levelUpdate = [];
          for (let levelId = 0; levelId < levelIdCounter; levelId++) {
            const levelData = await readContracts.JBNFT.levels(levelId);

            let image;
            const title = config?.nfts?.levels[levelId].title;
            const description = config?.nfts?.levels[levelId].description;

            if (config.nfts.levels[levelId].cachedImage) {
              image = config.nfts.levels[levelId].cachedImage;
            } else {
              const jsonManifestBuffer = await ipfs.getFromIPFS(levelData[1]);
              const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
              image = jsonManifest.image;
            }
            levelUpdate.push({ id: levelId, price: levelData[0], image, title, description });
          }
          if (DEBUG) console.log("Levels: ", levelUpdate);
          setLevels(levelUpdate);
        }
        setLoadingLevels(false);
      }
    };
    updateLevels();
    // eslint-disable-next-line
  }, [DEBUG, readContracts.JBNFT]);

  return (
    <div>
      <div style={{ margin: "auto", padding: 32, paddingBottom: 0, maxWidth: 980 }}>
        <div style={{ marginTop: 50 }}>
          <div style={{ fontSize: 24 }}>
            <h2>
              <strong>BuidlGuidl NFTs</strong>
            </h2>
            <p>Mint an NFT and support the BuidlGuidl on JuiceBox.</p>
            {targetNetwork.chainId === 1 && <p>In Treasury: Ξ{balanceETH}</p>}
          </div>

          <div>
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 1,
                md: 2,
                lg: 2,
                xl: 3,
                xxl: 3,
              }}
              pagination={false}
              loading={loadingLevels}
              dataSource={levels}
              renderItem={level => {
                return (
                  <List.Item key={level.id}>
                    <Card style={{ border: "none" }} headStyle={{ borderBottom: "none" }}>
                      <img
                        style={{ maxWidth: "100%", height: "auto" }}
                        src={level.image}
                        alt={"Level #" + level.id}
                        width="380"
                        height="300"
                      />
                      <h2 style={{ marginTop: "10px", marginBottom: 0, fontSize: 24 }}>
                        <strong>{level.title}</strong>
                      </h2>
                      <p style={{ color: "#8c8c8c", fontSize: 16 }}>{level.description}</p>
                      <Button
                        style={{
                          width: "100%",
                          maxWidth: 380,
                          fontSize: 20,
                          height: 50,
                          backgroundColor: "#3182ce",
                          color: "white",
                          border: "none",
                          fontWeight: "bold",
                          marginTop: "5px",
                        }}
                        type="primary"
                        onClick={async () => {
                          try {
                            console.log("price: ", level.price);
                            const txCur = await tx(
                              writeContracts.JBNFT.mintItem(level.id, {
                                value: level.price,
                              }),
                            );
                            await txCur.wait();
                            message.success("Successfully minted. Thanks!");
                          } catch (e) {
                            console.log("mint failed", e);
                          }
                        }}
                      >
                        MINT for Ξ{ethers.utils.formatEther(level.price)}
                      </Button>
                    </Card>
                  </List.Item>
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
